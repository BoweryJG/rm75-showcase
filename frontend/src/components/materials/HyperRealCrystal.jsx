import React, { useRef, useMemo } from 'react';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader material for hyper-realistic crystal
const HyperRealCrystalMaterial = shaderMaterial(
  {
    // Uniforms
    time: 0,
    envMap: null,
    envMapIntensity: 1.0,
    ior: 1.77, // Sapphire IOR
    thickness: 1.0,
    roughness: 0.02,
    metalness: 0.0,
    transmission: 1.0,
    opacity: 0.15,
    chromaticAberration: 0.03,
    anisotropy: 0.1,
    distortion: 0.0,
    distortionScale: 0.5,
    temporalDistortion: 0.0,
    color: new THREE.Color(1, 1, 1),
    attenuationDistance: 0.5,
    attenuationColor: new THREE.Color(1, 1, 1),
    subsurfaceColor: new THREE.Color(0.8, 0.9, 1.0),
    subsurfaceIntensity: 0.5,
    causticIntensity: 1.0,
    microRoughness: 0.05,
    cameraPosition: new THREE.Vector3(),
    resolution: new THREE.Vector2(1, 1),
    // Fresnel parameters
    fresnelBias: 0.01,
    fresnelScale: 1.0,
    fresnelPower: 2.0,
  },
  // Vertex shader
  `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;
    varying vec2 vUv;
    varying float vDistortion;
    
    uniform float time;
    uniform float distortion;
    uniform float distortionScale;
    uniform float temporalDistortion;
    
    void main() {
      vUv = uv;
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      vec3 viewDirection = cameraPosition - vWorldPosition;
      vViewDirection = normalize(viewDirection);
      
      // Add subtle temporal distortion for dynamic effect
      vec3 distortedPosition = position;
      if (temporalDistortion > 0.0) {
        float noise = sin(position.x * 10.0 + time) * cos(position.y * 10.0 + time * 0.7) * sin(position.z * 10.0 + time * 1.3);
        distortedPosition += normal * noise * temporalDistortion * 0.01;
      }
      
      // Calculate distortion factor for chromatic aberration
      vDistortion = dot(vWorldNormal, vViewDirection);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec3 vViewDirection;
    varying vec2 vUv;
    varying float vDistortion;
    
    uniform float time;
    uniform vec3 color;
    uniform vec3 attenuationColor;
    uniform vec3 subsurfaceColor;
    uniform float subsurfaceIntensity;
    uniform float ior;
    uniform float roughness;
    uniform float microRoughness;
    uniform float metalness;
    uniform float transmission;
    uniform float opacity;
    uniform float thickness;
    uniform float attenuationDistance;
    uniform float chromaticAberration;
    uniform float anisotropy;
    uniform float causticIntensity;
    uniform vec3 cameraPosition;
    uniform vec2 resolution;
    uniform samplerCube envMap;
    uniform float envMapIntensity;
    
    // Fresnel uniforms
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    
    // Schlick's approximation for Fresnel
    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
      return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
    }
    
    // Enhanced Fresnel with bias, scale, and power
    float fresnelEffect(vec3 normal, vec3 viewDir) {
      float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(normal, viewDir), fresnelPower);
      return clamp(fresnel, 0.0, 1.0);
    }
    
    // GGX/Trowbridge-Reitz normal distribution
    float distributionGGX(vec3 N, vec3 H, float roughness) {
      float a = roughness * roughness;
      float a2 = a * a;
      float NdotH = max(dot(N, H), 0.0);
      float NdotH2 = NdotH * NdotH;
      
      float num = a2;
      float denom = (NdotH2 * (a2 - 1.0) + 1.0);
      denom = 3.14159265359 * denom * denom;
      
      return num / denom;
    }
    
    // Geometry function for Smith model
    float geometrySchlickGGX(float NdotV, float roughness) {
      float r = (roughness + 1.0);
      float k = (r * r) / 8.0;
      
      float num = NdotV;
      float denom = NdotV * (1.0 - k) + k;
      
      return num / denom;
    }
    
    float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
      float NdotV = max(dot(N, V), 0.0);
      float NdotL = max(dot(N, L), 0.0);
      float ggx2 = geometrySchlickGGX(NdotV, roughness);
      float ggx1 = geometrySchlickGGX(NdotL, roughness);
      
      return ggx1 * ggx2;
    }
    
    // Caustics calculation
    vec3 calculateCaustics(vec3 refractedRay, float depth) {
      // Simulate caustic patterns
      float causticPattern = 0.0;
      
      // Multiple octaves of caustic patterns
      for (int i = 0; i < 3; i++) {
        float scale = pow(2.0, float(i));
        vec2 coord = refractedRay.xy * scale + time * 0.1 * float(i + 1);
        causticPattern += sin(coord.x * 10.0) * cos(coord.y * 10.0) * (1.0 / scale);
      }
      
      causticPattern = (causticPattern + 1.0) * 0.5;
      causticPattern = pow(causticPattern, 2.0);
      
      return vec3(causticPattern) * causticIntensity * depth;
    }
    
    // Chromatic aberration for dispersion
    vec3 chromaticAberrationLookup(samplerCube tex, vec3 dir, float amount) {
      float r = texture(tex, dir + vec3(amount, 0.0, 0.0)).r;
      float g = texture(tex, dir).g;
      float b = texture(tex, dir - vec3(amount, 0.0, 0.0)).b;
      return vec3(r, g, b);
    }
    
    // Subsurface scattering approximation
    vec3 subsurfaceScattering(vec3 lightDir, vec3 viewDir, vec3 normal, float thickness) {
      vec3 scatterDir = normalize(lightDir + normal * 0.5);
      float scatterAmount = pow(max(0.0, dot(viewDir, scatterDir)), 3.0);
      float attenuation = exp(-thickness / attenuationDistance);
      return subsurfaceColor * scatterAmount * attenuation * subsurfaceIntensity;
    }
    
    void main() {
      vec3 N = normalize(vWorldNormal);
      vec3 V = normalize(vViewDirection);
      
      // Calculate refraction
      float eta = 1.0 / ior;
      vec3 refractedRay = refract(-V, N, eta);
      
      // If total internal reflection occurs
      if (length(refractedRay) == 0.0) {
        refractedRay = reflect(-V, N);
      }
      
      // Sample environment with chromatic aberration
      vec3 envColor = vec3(0.0);
      if (envMap != null) {
        float aberrationAmount = chromaticAberration * (1.0 - abs(vDistortion));
        envColor = chromaticAberrationLookup(envMap, refractedRay, aberrationAmount) * envMapIntensity;
      }
      
      // Calculate Fresnel effect
      float fresnel = fresnelEffect(N, V);
      vec3 F0 = vec3(0.04); // Non-metallic F0
      vec3 F = fresnelSchlick(max(dot(N, V), 0.0), F0);
      
      // Reflection
      vec3 reflectedRay = reflect(-V, N);
      vec3 reflectionColor = vec3(0.0);
      if (envMap != null) {
        // Add micro-roughness to reflection
        vec3 roughReflection = reflectedRay;
        float theta = microRoughness * 3.14159;
        roughReflection.x += sin(theta * 7.0) * microRoughness;
        roughReflection.y += cos(theta * 5.0) * microRoughness;
        reflectionColor = texture(envMap, roughReflection).rgb * envMapIntensity;
      }
      
      // Calculate caustics
      vec3 caustics = calculateCaustics(refractedRay, thickness);
      
      // Subsurface scattering
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Simplified light direction
      vec3 sss = subsurfaceScattering(lightDir, V, N, thickness);
      
      // Combine refraction and reflection based on Fresnel
      vec3 finalColor = mix(envColor, reflectionColor, fresnel);
      
      // Apply color tint and attenuation
      float attenuation = exp(-thickness / attenuationDistance);
      finalColor *= color;
      finalColor = mix(finalColor, attenuationColor, 1.0 - attenuation);
      
      // Add caustics and subsurface scattering
      finalColor += caustics * transmission;
      finalColor += sss;
      
      // Apply anisotropic highlights
      if (anisotropy > 0.0) {
        vec3 H = normalize(V + lightDir);
        float NdotH = max(dot(N, H), 0.0);
        float anisotropicHighlight = pow(NdotH, 32.0 / (1.0 + anisotropy * 10.0));
        finalColor += vec3(anisotropicHighlight) * anisotropy;
      }
      
      // Output with proper alpha
      float alpha = mix(opacity, 1.0, fresnel);
      gl_FragColor = vec4(finalColor, alpha);
      
      // Tone mapping for HDR
      gl_FragColor.rgb = gl_FragColor.rgb / (gl_FragColor.rgb + vec3(1.0));
      gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2)); // Gamma correction
    }
  `
);

// Extend Three.js with our custom material
extend({ HyperRealCrystalMaterial });

// Color presets for different crystal variants
const CRYSTAL_VARIANTS = {
  clear: {
    color: new THREE.Color(1.0, 1.0, 1.0),
    attenuationColor: new THREE.Color(0.95, 0.95, 0.95),
    subsurfaceColor: new THREE.Color(0.9, 0.95, 1.0),
    subsurfaceIntensity: 0.3,
  },
  lilacPink: {
    color: new THREE.Color(1.0, 0.85, 0.95),
    attenuationColor: new THREE.Color(0.9, 0.7, 0.85),
    subsurfaceColor: new THREE.Color(1.0, 0.8, 0.9),
    subsurfaceIntensity: 0.5,
  },
  sapphireBlue: {
    color: new THREE.Color(0.7, 0.85, 1.0),
    attenuationColor: new THREE.Color(0.4, 0.6, 0.9),
    subsurfaceColor: new THREE.Color(0.6, 0.8, 1.0),
    subsurfaceIntensity: 0.6,
  },
};

const HyperRealCrystal = ({
  variant = 'clear',
  thickness = 1.0,
  roughness = 0.02,
  transmission = 1.0,
  chromaticAberration = 0.03,
  causticIntensity = 1.0,
  temporalDistortion = 0.0,
  anisotropy = 0.1,
  microRoughness = 0.05,
  envMapIntensity = 1.0,
  fresnelBias = 0.01,
  fresnelScale = 1.0,
  fresnelPower = 2.0,
  ...props
}) => {
  const materialRef = useRef();
  const { gl, scene } = useThree();
  
  // Get variant colors
  const variantColors = useMemo(() => CRYSTAL_VARIANTS[variant] || CRYSTAL_VARIANTS.clear, [variant]);
  
  // Get environment map from scene
  const envMap = useMemo(() => scene.environment, [scene.environment]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.getElapsedTime();
      materialRef.current.cameraPosition = state.camera.position;
      materialRef.current.resolution.set(gl.domElement.width, gl.domElement.height);
    }
  });
  
  return (
    <hyperRealCrystalMaterial
      ref={materialRef}
      {...variantColors}
      thickness={thickness}
      roughness={roughness}
      transmission={transmission}
      chromaticAberration={chromaticAberration}
      causticIntensity={causticIntensity}
      temporalDistortion={temporalDistortion}
      anisotropy={anisotropy}
      microRoughness={microRoughness}
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      fresnelBias={fresnelBias}
      fresnelScale={fresnelScale}
      fresnelPower={fresnelPower}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
      {...props}
    />
  );
};

export default HyperRealCrystal;

// Export variants for easy access
export { CRYSTAL_VARIANTS };