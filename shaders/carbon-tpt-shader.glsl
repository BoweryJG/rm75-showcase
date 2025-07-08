// Carbon TPT (Thin Ply Technology) Shader
// Vertex Shader
const carbonTPTVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 tangent;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;
    
    vNormal = normalize(normalMatrix * normal);
    vTangent = normalize(normalMatrix * tangent);
    vBitangent = cross(vNormal, vTangent);
    vUv = uv;
    
    gl_Position = projectionMatrix * viewPosition;
}
`;

// Fragment Shader
const carbonTPTFragmentShader = `
precision highp float;

uniform vec3 cameraPosition;
uniform float time;
uniform float temperature; // Celsius
uniform float airPressure; // hPa
uniform float humidity; // 0-1

// Material properties
uniform vec3 baseColor;
uniform vec3 accentColor;
uniform float roughness;
uniform float metalness;
uniform float iorFiber;
uniform float weaveScale;
uniform float microTextureScale;

// Lighting
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform samplerCube envMap;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;

// Constants
const float PI = 3.14159265359;
const vec3 FIBER_DIRECTION = vec3(1.0, 0.0, 0.0);

// Noise functions for procedural textures
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0, 0.0)), 
                   hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), 
                   hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Carbon fiber weave pattern
float carbonWeavePattern(vec2 uv) {
    vec2 weaveUV = uv * weaveScale;
    vec2 id = floor(weaveUV);
    vec2 st = fract(weaveUV);
    
    // Create interlaced pattern
    float isHorizontal = mod(id.x + id.y, 2.0);
    float pattern = isHorizontal > 0.5 ? st.x : st.y;
    
    // Add fiber texture
    float fiberNoise = noise(uv * microTextureScale);
    pattern += fiberNoise * 0.1;
    
    return smoothstep(0.3, 0.7, pattern);
}

// Iridescent color shift based on viewing angle
vec3 iridescence(float cosTheta, vec3 baseCol) {
    float a = 1.0 - cosTheta;
    float a2 = a * a;
    float a5 = a2 * a2 * a;
    
    // Thin film interference
    vec3 shift = vec3(
        sin(a5 * 15.0 + time * 0.1),
        sin(a5 * 20.0 + time * 0.15),
        sin(a5 * 25.0 + time * 0.2)
    ) * 0.2;
    
    return baseCol + shift * accentColor;
}

// Temperature-based color modulation
vec3 temperatureColorShift(vec3 color, float temp) {
    // Normalize temperature to [-1, 1] range (assuming -20°C to 60°C range)
    float normalizedTemp = (temp - 20.0) / 40.0;
    
    // Cold: shift towards blue, Hot: shift towards red/orange
    vec3 coldShift = vec3(0.9, 0.95, 1.1);
    vec3 hotShift = vec3(1.1, 0.95, 0.85);
    
    vec3 tempModulation = mix(coldShift, hotShift, normalizedTemp * 0.5 + 0.5);
    return color * tempModulation;
}

// GGX distribution function
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
    
    return num / denom;
}

// Geometry function
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    
    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    
    return num / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
}

// Fresnel equation
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 B = normalize(vBitangent);
    
    // TBN matrix for normal mapping
    mat3 TBN = mat3(T, B, N);
    
    // Generate procedural normal from weave pattern
    vec2 weaveGrad = vec2(
        carbonWeavePattern(vUv + vec2(0.001, 0.0)) - carbonWeavePattern(vUv - vec2(0.001, 0.0)),
        carbonWeavePattern(vUv + vec2(0.0, 0.001)) - carbonWeavePattern(vUv - vec2(0.0, 0.001))
    ) * 100.0;
    
    vec3 microNormal = normalize(vec3(-weaveGrad.x, -weaveGrad.y, 1.0));
    N = normalize(TBN * microNormal);
    
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // Base color with weave pattern
    float weavePattern = carbonWeavePattern(vUv);
    vec3 albedo = mix(baseColor * 0.8, baseColor, weavePattern);
    
    // Add iridescence
    float cosTheta = dot(N, V);
    albedo = iridescence(cosTheta, albedo);
    
    // Temperature color shift
    albedo = temperatureColorShift(albedo, temperature);
    
    // Air pressure affects material appearance slightly
    float pressureEffect = (airPressure - 1013.0) / 1000.0;
    albedo *= 1.0 + pressureEffect * 0.05;
    
    // PBR calculations
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metalness);
    
    // Cook-Torrance BRDF
    float NDF = DistributionGGX(N, H, roughness);
    float G = GeometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metalness;
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(N, L), 0.0);
    vec3 Lo = (kD * albedo / PI + specular) * lightColor * lightIntensity * NdotL;
    
    // Environment reflection
    vec3 R = reflect(-V, N);
    vec3 envColor = textureCube(envMap, R).rgb;
    vec3 envSpecular = envColor * F * (1.0 - roughness);
    
    // Combine lighting
    vec3 color = Lo + envSpecular * 0.3;
    
    // Tone mapping and gamma correction
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
`;