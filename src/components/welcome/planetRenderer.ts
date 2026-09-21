/**
 * three.js scene behind the welcome-screen hero planet.
 *
 * expo-gl hands back a raw WebGL context from `GLView`; three's WebGLRenderer is
 * pointed at it through a minimal canvas shim. Textures are uploaded from
 * `expo-asset`: on native expo-gl accepts `{ localUri }` as a texImage2D /
 * texSubImage2D pixel source, on web three's TextureLoader fetches the asset URL.
 *
 * Surface imagery: NASA / three.js example maps — earth_atmos_2048,
 * earth_clouds_1024, earth_specular_2048, earth_normal_2048, earth_lights_2048.
 */
import { layout, type Palette } from '@/theme';
import { Asset } from 'expo-asset';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import { PixelRatio, Platform } from 'react-native';
import * as THREE from 'three';

const EARTH_MAPS = {
  day: require('../../../assets/textures/earth_day.jpg'),
  night: require('../../../assets/textures/earth_night.png'),
  specular: require('../../../assets/textures/earth_specular.jpg'),
  normal: require('../../../assets/textures/earth_normal.jpg'),
  clouds: require('../../../assets/textures/earth_clouds.png'),
};

const CAMERA_FOV = 42;
const PLANET_WIDTH_RATIO = 0.94; // planet diameter as a share of the phone-width frame
const PLANET_CENTER_Y = 0.38; // planet centre as a share of the screen height
const SKY_RADIUS = 120;
const STAR_RADIUS = 45;
const STAR_COUNT = 420;
const EARTH_RADIUS = 1;
const NIGHT_RADIUS = 1.002;
const CLOUD_RADIUS = 1.006;
const ATMOSPHERE_RADIUS = 1.055;
const EARTH_SPIN = 0.045; // radians per second
const CLOUD_SPIN = 0.058;
const SUN_DIRECTION = new THREE.Vector3(-6, 2.6, 5.2).normalize();

type Uniform<T> = { value: T };

export type SkyUniforms = {
  uTop: Uniform<THREE.Color>;
  uMid: Uniform<THREE.Color>;
  uBottom: Uniform<THREE.Color>;
  uNebulaA: Uniform<THREE.Color>;
  uNebulaB: Uniform<THREE.Color>;
};

export type GlowUniforms = {
  uColor: Uniform<THREE.Color>;
  uSunDir: Uniform<THREE.Vector3>;
};

export type NightUniforms = {
  uMap: Uniform<THREE.Texture>;
  uSunDir: Uniform<THREE.Vector3>;
  uIntensity: Uniform<number>;
};

/**
 * Turns a bundled image into a three texture. Native uploads go through the
 * `{ localUri }` object expo-gl understands; web falls back to three's loader.
 */
async function loadMap(module: number, srgb: boolean): Promise<THREE.Texture> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();

  if (Platform.OS === 'web') {
    const texture = await new THREE.TextureLoader().loadAsync(asset.localUri ?? asset.uri);
    texture.anisotropy = 4;
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // expo-gl uploads the `{ localUri }` object we place in `image`; the shape
  // mirrors DataTexture's image so three takes its raw-data upload path.
  const width = asset.width ?? 1;
  const height = asset.height ?? 1;
  const texture = new THREE.DataTexture(null, width, height);
  texture.image = { data: asset, width, height } as unknown as typeof texture.image;
  texture.flipY = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** three's WebGLRenderer expects a canvas; expo-gl only hands us the context. */
function createRenderer(gl: ExpoWebGLRenderingContext, width: number, height: number) {
  const canvas = {
    width,
    height,
    clientWidth: width,
    clientHeight: height,
    style: {} as Record<string, string>,
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getContext: () => gl,
  };

  // `context` is deliberately not passed. three only runs its "WebGL 1 is not
  // supported since r163" guard when a context is handed to it, and expo-gl
  // makes WebGL2RenderingContext inherit from WebGLRenderingContext so that a
  // genuine WebGL 2 context reports `instanceof WebGLRenderingContext`. That is
  // a false positive which kills the renderer on native. Leaving it undefined
  // sends three through `canvas.getContext('webgl2')` below instead, which is
  // the same context, minus the misdetection.
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas as unknown as HTMLCanvasElement,
    alpha: false,
    antialias: false,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 1);
  return renderer;
}

const RGBA = /^rgba?\(([^)]*)\)$/i;

/**
 * Palette entries may be `rgba(...)`. three's Color carries no alpha and warns
 * when it is dropped, so the alpha is stripped here — the sky shader already
 * scales each nebula tint by its own intensity.
 */
function toColor(style: string): THREE.Color {
  const match = RGBA.exec(style);
  if (!match) return new THREE.Color(style);
  const [r, g, b] = match[1].split(',');
  return new THREE.Color(`rgb(${r.trim()},${g.trim()},${b.trim()})`);
}

/** Theme-coloured space backdrop, painted on the inside of a large sphere. */
function createSky(colors: Palette) {
  const uniforms: SkyUniforms = {
    uTop: { value: toColor(colors.sky[2]) },
    uMid: { value: toColor(colors.sky[1]) },
    uBottom: { value: toColor(colors.sky[0]) },
    uNebulaA: { value: toColor(colors.nebulaA) },
    uNebulaB: { value: toColor(colors.nebulaB) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uMid;
      uniform vec3 uBottom;
      uniform vec3 uNebulaA;
      uniform vec3 uNebulaB;
      varying vec3 vDir;

      float halo(vec3 dir, vec3 centre, float sharpness) {
        return pow(max(dot(dir, normalize(centre)), 0.0), sharpness);
      }

      void main() {
        float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 tone = mix(uBottom, uMid, smoothstep(0.0, 0.55, h));
        tone = mix(tone, uTop, smoothstep(0.5, 1.0, h));
        tone += uNebulaA * halo(vDir, vec3(0.55, 0.5, 0.6), 6.0) * 0.45;
        tone += uNebulaB * halo(vDir, vec3(-0.7, -0.2, 0.45), 6.0) * 0.45;
        gl_FragColor = vec4(tone, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });

  const geometry = new THREE.SphereGeometry(SKY_RADIUS, 32, 24);
  return { mesh: new THREE.Mesh(geometry, material), geometry, material, uniforms };
}

/** Deterministic point cloud, so the star layout is identical on every launch. */
function createStars(colors: Palette) {
  const positions = new Float32Array(STAR_COUNT * 3);
  let seed = 20260920;

  for (let i = 0; i < STAR_COUNT; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const y = (seed / 2147483647) * 2 - 1;
    seed = (seed * 16807) % 2147483647;
    const theta = (seed / 2147483647) * Math.PI * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));

    positions[i * 3] = Math.cos(theta) * ring * STAR_RADIUS;
    positions[i * 3 + 1] = y * STAR_RADIUS;
    positions[i * 3 + 2] = Math.sin(theta) * ring * STAR_RADIUS;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(colors.starDot),
    size: 1.7 * PixelRatio.get(),
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  return { points: new THREE.Points(geometry, material), geometry, material };
}

/**
 * Owns the three.js objects and the render loop for one expo-gl context.
 * Everything it allocates is released again in `dispose`.
 */
export class PlanetRenderer {
  private readonly gl: ExpoWebGLRenderingContext;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly planet = new THREE.Group();
  private readonly earthSpin = new THREE.Group();
  private readonly cloudSpin = new THREE.Group();
  private readonly skyUniforms: SkyUniforms;
  private readonly glowUniforms: GlowUniforms;
  private readonly starMaterial: THREE.PointsMaterial;
  private readonly timer = new THREE.Timer();
  private readonly textures: THREE.Texture[] = [];
  private readonly owned: { dispose(): void }[] = [];
  private nightUniforms: NightUniforms | null = null;
  private frame: number | null = null;
  private width: number;
  private height: number;
  private paused = false;
  private reduced: boolean;
  private dirty = true;
  private disposed = false;

  constructor(gl: ExpoWebGLRenderingContext, colors: Palette, reduced: boolean) {
    this.gl = gl;
    this.reduced = reduced;
    this.width = Math.max(1, gl.drawingBufferWidth);
    this.height = Math.max(1, gl.drawingBufferHeight);

    this.renderer = createRenderer(gl, this.width, this.height);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, this.width / this.height, 0.5, 400);
    this.frameCamera();

    const sky = createSky(colors);
    this.skyUniforms = sky.uniforms;
    this.scene.add(sky.mesh);
    this.owned.push(sky.geometry, sky.material);

    const stars = createStars(colors);
    this.starMaterial = stars.material;
    this.scene.add(stars.points);
    this.owned.push(stars.geometry, stars.material);

    this.glowUniforms = {
      uColor: { value: new THREE.Color(colors.spark) },
      uSunDir: { value: SUN_DIRECTION.clone() },
    };

    const ambient = new THREE.AmbientLight(0xffffff, 0.16);
    const sun = new THREE.DirectionalLight(0xfff3e2, 2.6);
    sun.position.copy(SUN_DIRECTION).multiplyScalar(10);
    this.scene.add(ambient, sun);

    this.scene.add(this.planet);
    this.planet.add(this.earthSpin, this.cloudSpin);
  }

  /** Loads the surface maps, then attaches the planet. Call once per context. */
  async loadPlanet() {
    const [day, night, specular, normal, clouds] = await Promise.all([
      loadMap(EARTH_MAPS.day, true),
      loadMap(EARTH_MAPS.night, true),
      loadMap(EARTH_MAPS.specular, false),
      loadMap(EARTH_MAPS.normal, false),
      loadMap(EARTH_MAPS.clouds, true),
    ]);

    if (this.disposed) {
      [day, night, specular, normal, clouds].forEach((texture) => texture.dispose());
      return;
    }

    this.textures.push(day, night, specular, normal, clouds);

    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 64);
    this.owned.push(geometry);

    const surface = new THREE.MeshPhongMaterial({
      map: day,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.8, 0.8),
      specularMap: specular,
      specular: new THREE.Color(0x2f4a6b),
      shininess: 18,
    });
    this.owned.push(surface);
    const earth = new THREE.Mesh(geometry, surface);
    earth.renderOrder = 0;
    this.earthSpin.add(earth);

    this.nightUniforms = {
      uMap: { value: night },
      uSunDir: { value: SUN_DIRECTION.clone() },
      uIntensity: { value: 1.4 },
    };
    const cityLights = new THREE.ShaderMaterial({
      uniforms: this.nightUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vUv = uv;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uSunDir;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vec3 lights = texture2D(uMap, vUv).rgb;
          float facing = dot(normalize(vWorldNormal), normalize(uSunDir));
          float night = 1.0 - smoothstep(-0.30, 0.12, facing);
          gl_FragColor = vec4(lights * uIntensity * night, 1.0);
          #include <colorspace_fragment>
        }
      `,
    });
    this.owned.push(cityLights);
    const lights = new THREE.Mesh(geometry, cityLights);
    lights.scale.setScalar(NIGHT_RADIUS);
    lights.renderOrder = 1;
    this.earthSpin.add(lights);

    // The cloud map carries its own alpha — white clouds over a transparent
    // background — so it belongs in `map`. As an `alphaMap` three would read
    // its green channel instead, which stays white across the transparent
    // background too, painting a milky shell over the whole globe.
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: clouds,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      shininess: 4,
      specular: new THREE.Color(0x0d141f),
    });
    this.owned.push(cloudMaterial);
    const cloudLayer = new THREE.Mesh(geometry, cloudMaterial);
    cloudLayer.scale.setScalar(CLOUD_RADIUS);
    cloudLayer.renderOrder = 2;
    this.cloudSpin.add(cloudLayer);

    const atmosphere = new THREE.ShaderMaterial({
      uniforms: this.glowUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uSunDir;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          float rim = pow(clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.0);
          float lit = clamp(dot(normalize(vWorldNormal), normalize(uSunDir)), 0.0, 1.0);
          gl_FragColor = vec4(uColor * rim * (0.2 + 1.5 * lit) * 1.35, 1.0);
          #include <colorspace_fragment>
        }
      `,
    });
    this.owned.push(atmosphere);
    const halo = new THREE.Mesh(geometry, atmosphere);
    halo.scale.setScalar(ATMOSPHERE_RADIUS);
    halo.renderOrder = 3;
    this.planet.add(halo);

    this.requestFrame();
  }

  /** Renders at least one frame; keeps animating while motion is allowed. */
  requestFrame() {
    this.dirty = true;
    if (this.disposed || this.paused || this.frame !== null) return;
    this.frame = requestAnimationFrame(this.step);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) {
      if (this.frame !== null) {
        cancelAnimationFrame(this.frame);
        this.frame = null;
      }
      return;
    }
    this.requestFrame();
  }

  setReduced(reduced: boolean) {
    if (this.reduced === reduced) return;
    this.reduced = reduced;
    this.requestFrame();
  }

  applyTheme(colors: Palette) {
    this.skyUniforms.uTop.value.copy(toColor(colors.sky[2]));
    this.skyUniforms.uMid.value.copy(toColor(colors.sky[1]));
    this.skyUniforms.uBottom.value.copy(toColor(colors.sky[0]));
    this.skyUniforms.uNebulaA.value.copy(toColor(colors.nebulaA));
    this.skyUniforms.uNebulaB.value.copy(toColor(colors.nebulaB));
    this.starMaterial.color.copy(toColor(colors.starDot));
    this.glowUniforms.uColor.value.copy(toColor(colors.spark));
    this.requestFrame();
  }

  dispose() {
    this.disposed = true;
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.textures.forEach((texture) => texture.dispose());
    this.owned.forEach((item) => item.dispose());
    this.textures.length = 0;
    this.owned.length = 0;
    try {
      this.renderer.dispose();
    } catch {
      // the underlying context may already be torn down
    }
  }

  /**
   * Keeps the planet framed at a fixed share of the phone-width column.
   * `drawingBuffer*` is in device pixels on native (view x density) but is sized
   * to the window on web, so the two platforms cap the span differently.
   */
  private frameCamera() {
    const halfFov = THREE.MathUtils.degToRad(CAMERA_FOV / 2);
    const cap = Platform.OS === 'web' ? this.width : layout.phone * PixelRatio.get();
    const target = Math.min(this.width, cap) * PLANET_WIDTH_RATIO;
    const distance = this.height / (Math.tan(halfFov) * target);
    this.camera.aspect = this.width / this.height;
    this.camera.position.set(0, 0, distance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.planet.position.y = (0.5 - PLANET_CENTER_Y) * 2 * distance * Math.tan(halfFov);
  }

  private resize() {
    const width = this.gl.drawingBufferWidth;
    const height = this.gl.drawingBufferHeight;
    if (width < 1 || height < 1) return false;
    if (width === this.width && height === this.height) return false;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.frameCamera();
    return true;
  }

  private readonly step = () => {
    this.frame = null;
    if (this.disposed || this.paused) return;

    const resized = this.resize();
    if (this.reduced && !resized && !this.dirty) return;

    this.dirty = false;
    if (!this.reduced) {
      this.timer.update();
      const delta = Math.min(this.timer.getDelta(), 0.05);
      this.earthSpin.rotation.y += delta * EARTH_SPIN;
      this.cloudSpin.rotation.y += delta * CLOUD_SPIN;
    }

    this.renderer.render(this.scene, this.camera);
    this.gl.flush();
    this.gl.endFrameEXP();

    if (!this.reduced) this.frame = requestAnimationFrame(this.step);
  };
}
