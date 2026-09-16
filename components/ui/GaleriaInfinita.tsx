"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Galeria infinita em WebGL — versão otimizada.
 *
 * A primeira versão travava a página. O que pesava, em ordem:
 *
 * 1. BLUR DE 25 AMOSTRAS por pixel (laço 5×5 no fragment shader), em planos
 *    que se sobrepõem quase em tela cheia. Agora é UMA amostra com viés de
 *    mipmap: `texture2D(map, uv, lod)`. O ganho é de ~25× em taxa de
 *    preenchimento, que era o gargalo real.
 * 2. TEXTURAS GIGANTES (até 1216×2160 ⇒ ~67 MB de VRAM no conjunto). Agora
 *    são cópias de no máximo 560px em /public/galeria.
 * 3. GEOMETRIA de 24×24 segmentos por plano (576 quads). O deslocamento de
 *    vértice foi removido junto com a ondulação, então basta 1×1 — e a
 *    geometria é ÚNICA, compartilhada por todos os planos.
 * 4. 22 planos, `dpr` até 1.75 e `antialias`. Agora 10 planos, dpr 1, sem
 *    antialias (imperceptível sobre fotografia).
 *
 * Continua sem sequestrar a rolagem: lê `window.scrollY` passivamente, porque
 * o Lenis é o dono único do scroll deste site.
 */

type Foto = { src: string; alt?: string };

const PROFUNDIDADE = 50;
const DESLOC_H = 5.2;
const DESLOC_V = 3.4;
const ESCALA = 3.2;

function criarMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      map: { value: null },
      opacity: { value: 1 },
      nivelBorrado: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float nivelBorrado;
      varying vec2 vUv;

      void main() {
        // Uma amostra só. O desfoque vem do nível de mipmap, não de um laço.
        vec4 cor = texture2D(map, vUv, nivelBorrado);
        gl_FragColor = vec4(cor.rgb, cor.a * opacity);
      }
    `,
  });
}

function Cena({
  fotos,
  quantidade,
  onPronto,
}: {
  fotos: Foto[];
  quantidade: number;
  onPronto?: () => void;
}) {
  /**
   * Os mipmaps são o que torna o desfoque barato — sem eles o viés de LOD no
   * shader não tem nível nenhum para amostrar. A configuração vai no callback
   * de carga do próprio `useTexture`: mexer nas texturas depois, num efeito,
   * é modificar valor devolvido por hook.
   */
  const texturas = useTexture(
    fotos.map((f) => f.src),
    (carregadas) => {
      for (const t of [carregadas].flat() as THREE.Texture[]) {
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.anisotropy = 1;
        t.needsUpdate = true;
      }
    },
  );

  const lista = useMemo(
    () => (Array.isArray(texturas) ? texturas : [texturas]),
    [texturas],
  );

  const geometria = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const materiais = useMemo(
    () => Array.from({ length: quantidade }, criarMaterial),
    [quantidade],
  );

  useEffect(() => {
    return () => {
      geometria.dispose();
      materiais.forEach((m) => m.dispose());
    };
  }, [geometria, materiais]);

  const posicoes = useMemo(
    () =>
      Array.from({ length: quantidade }, (_, i) => ({
        x: (Math.sin((i * 2.618) % (Math.PI * 2)) * ((i % 3) * 1.2) * DESLOC_H) / 3,
        y:
          (Math.cos((i * 1.618 + Math.PI / 3) % (Math.PI * 2)) *
            (((i + 1) % 4) * 0.8) *
            DESLOC_V) /
          4,
      })),
    [quantidade],
  );

  const planos = useRef(
    Array.from({ length: quantidade }, (_, i) => ({
      z: ((PROFUNDIDADE / quantidade) * i) % PROFUNDIDADE,
      iFoto: i % Math.max(fotos.length, 1),
    })),
  );

  const malhas = useRef<(THREE.Mesh | null)[]>([]);
  const avisado = useRef(false);
  const velocidade = useRef(0);
  const yAnterior = useRef(0);

  useEffect(() => {
    yAnterior.current = window.scrollY;
  }, []);

  useFrame((_, delta) => {
    const y = window.scrollY;
    velocidade.current += (y - yAnterior.current) * 0.0025;
    yAnterior.current = y;

    velocidade.current += 0.35 * delta;
    velocidade.current *= 0.94;

    const v = velocidade.current;
    const meio = PROFUNDIDADE / 2;

    planos.current.forEach((p, i) => {
      let z = p.z + v * delta * 10;
      if (z >= PROFUNDIDADE) {
        z -= PROFUNDIDADE;
        p.iFoto = (p.iFoto + quantidade) % Math.max(lista.length, 1);
      } else if (z < 0) {
        z += PROFUNDIDADE;
      }
      p.z = z;

      const t = z / PROFUNDIDADE;

      const opacidade =
        t < 0.04
          ? 0
          : t < 0.2
            ? (t - 0.04) / 0.16
            : t < 0.4
              ? 1
              : t < 0.48
                ? 1 - (t - 0.4) / 0.08
                : 0;

      // Agora em NÍVEL DE MIPMAP (0 = nítido), não em pixels de raio.
      const nivel =
        t < 0.12 ? 3.5 * (1 - t / 0.12) : t < 0.4 ? 0 : ((t - 0.4) / 0.08) * 3.5;

      const mat = materiais[i];
      mat.uniforms.opacity.value = Math.max(0, Math.min(1, opacidade));
      mat.uniforms.nivelBorrado.value = Math.max(0, Math.min(4, nivel));

      const malha = malhas.current[i];
      if (!malha) return;

      // Fora de vista não paga nada além da conta acima.
      malha.visible = opacidade > 0.01;
      if (!malha.visible) return;

      const tex = lista[p.iFoto];
      if (tex && mat.uniforms.map.value !== tex) {
        mat.uniforms.map.value = tex;
      }

      const im = tex?.image as { width?: number; height?: number } | undefined;
      const proporcao = im?.width && im?.height ? im.width / im.height : 1;

      malha.position.set(posicoes[i].x, posicoes[i].y, z - meio);
      malha.scale.set(
        proporcao > 1 ? ESCALA * proporcao : ESCALA,
        proporcao > 1 ? ESCALA : ESCALA / proporcao,
        1,
      );
    });

    // Só aqui há foto de fato na tela: texturas carregadas e um quadro
    // desenhado. Antes disso o canvas é transparente e a seção ficava vazia.
    if (!avisado.current) {
      avisado.current = true;
      onPronto?.();
    }
  });

  return (
    <>
      {materiais.map((material, i) => (
        <mesh
          key={i}
          ref={(no) => {
            malhas.current[i] = no;
          }}
          geometry={geometria}
          material={material}
        />
      ))}
    </>
  );
}

export default function GaleriaInfinita({
  fotos,
  quantidade = 10,
  pausado = false,
  onPronto,
  onPerdido,
  className,
}: {
  fotos: Foto[];
  quantidade?: number;
  /** Fora de vista o laço de render para por completo. */
  pausado?: boolean;
  /** Chamado uma vez, no primeiro quadro com as texturas prontas. */
  onPronto?: () => void;
  /** O navegador derrubou o contexto WebGL (comum no celular). */
  onPerdido?: () => void;
  className?: string;
}) {
  if (fotos.length === 0) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 55 }}
        frameloop={pausado ? "never" : "always"}
        dpr={1}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              onPerdido?.();
            },
            { once: true },
          );
        }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Cena fotos={fotos} quantidade={quantidade} onPronto={onPronto} />
        </Suspense>
      </Canvas>
    </div>
  );
}
