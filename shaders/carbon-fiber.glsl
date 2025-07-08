// Carbon Fiber Shader for Richard Mille Watch Cases
// Realistic carbon fiber texture with depth and reflection

// Vertex Shader
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDirection;

void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = worldPosition.xyz;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    
    gl_Position = projectionMatrix * worldPosition;
}

// Fragment Shader
precision highp float;

uniform float time;
uniform float metalness;
uniform float roughness;
uniform vec3 baseColor;
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDirection;

// Noise functions for carbon fiber pattern
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

// Carbon fiber weave pattern
float carbonWeave(vec2 uv) {
    vec2 scaledUv = uv * 40.0;
    
    // Create fiber directions
    float fiber1 = abs(sin(scaledUv.x * 0.5) * cos(scaledUv.y * 0.25));
    float fiber2 = abs(cos(scaledUv.x * 0.25) * sin(scaledUv.y * 0.5));
    
    // Weave pattern
    float weave = step(0.5, fract(scaledUv.x * 0.1)) * step(0.5, fract(scaledUv.y * 0.1));
    
    return mix(fiber1, fiber2, weave) * 0.8 + 0.2;
}

// Physically Based Rendering functions
vec3 fresnel(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265 * denom * denom;
    
    return num / denom;
}

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

void main() {
    // Carbon fiber texture
    float weavePattern = carbonWeave(vUv);
    float noisePattern = fbm(vUv * 8.0) * 0.3;
    
    // Base carbon color with variation
    vec3 carbonColor = baseColor * (0.7 + weavePattern * 0.3 + noisePattern);
    
    // Normal mapping effect (simple approximation)
    vec3 normal = normalize(vNormal);
    float weaveNormal = (weavePattern - 0.5) * 0.1;
    normal.xy += weaveNormal;
    normal = normalize(normal);
    
    // Lighting calculations
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 viewDir = normalize(vViewDirection);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    
    // Material properties
    vec3 albedo = carbonColor;
    float metallic = metalness;
    float rough = roughness + weavePattern * 0.1;
    
    // Fresnel reflectance at normal incidence
    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    
    // Cook-Torrance BRDF
    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotL = max(dot(normal, lightDir), 0.0);
    float HdotV = max(dot(halfwayDir, viewDir), 0.0);
    
    vec3 F = fresnel(HdotV, F0);
    float NDF = distributionGGX(normal, halfwayDir, rough);
    float G = geometrySmith(normal, viewDir, lightDir, rough);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * NdotV * NdotL + 0.001;
    vec3 specular = numerator / denominator;
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    vec3 diffuse = kD * albedo / 3.14159265;
    
    vec3 radiance = lightColor * lightIntensity;
    vec3 Lo = (diffuse + specular) * radiance * NdotL;
    
    // Ambient lighting
    vec3 ambient = vec3(0.03) * albedo;
    
    vec3 color = ambient + Lo;
    
    // HDR tonemapping and gamma correction
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}