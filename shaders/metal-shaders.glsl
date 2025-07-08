// Metal Shaders Collection
// Titanium Vertex Shader
const titaniumVertexShader = `
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

// Titanium Fragment Shader
const titaniumFragmentShader = `
precision highp float;

uniform vec3 cameraPosition;
uniform float time;
uniform float temperature;
uniform float airPressure;
uniform float wearLevel; // 0-1

// Material properties
uniform vec3 baseColor;
uniform float roughness;
uniform float metalness;
uniform float anisotropy;
uniform int finishType; // 0: brushed, 1: polished, 2: sandblasted

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

const float PI = 3.14159265359;

// Noise functions
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

// Surface finish textures
vec3 brushedFinish(vec2 uv) {
    // Parallel lines for brushed finish
    float lines = sin(uv.x * 200.0) * 0.5 + 0.5;
    lines = pow(lines, 3.0);
    
    // Add micro-scratches
    float microNoise = noise(uv * 500.0) * 0.2;
    lines += microNoise;
    
    return vec3(lines, 0.0, 1.0 - lines * 0.3);
}

vec3 polishedFinish(vec2 uv) {
    // Very smooth surface with minimal texture
    float microVar = noise(uv * 100.0) * 0.05;
    return vec3(microVar, microVar, 1.0 - microVar * 0.1);
}

vec3 sandBlastFinish(vec2 uv) {
    // Random texture pattern
    float pattern = noise(uv * 80.0) * 0.6;
    pattern += noise(uv * 200.0) * 0.3;
    pattern += noise(uv * 500.0) * 0.1;
    
    return vec3(pattern * 0.5, pattern * 0.5, 1.0 - pattern * 0.4);
}

// Wear simulation
vec3 simulateWear(vec3 normal, vec2 uv, float wear) {
    if (wear < 0.01) return normal;
    
    // High-wear areas are smoother
    float wearPattern = noise(uv * 20.0) * noise(uv * 50.0);
    wearPattern = smoothstep(0.6, 1.0, wearPattern);
    
    float localWear = wear * wearPattern;
    
    // Worn areas become more polished
    vec3 wornNormal = mix(normal, vec3(0.0, 0.0, 1.0), localWear * 0.7);
    
    return normalize(wornNormal);
}

// Anisotropic GGX distribution
float DistributionGGX_Aniso(vec3 N, vec3 H, vec3 T, vec3 B, float roughness, float aniso) {
    float roughnessT = roughness * (1.0 + aniso);
    float roughnessB = roughness * (1.0 - aniso);
    
    float HdotT = dot(H, T);
    float HdotB = dot(H, B);
    float HdotN = dot(H, N);
    
    float a2T = roughnessT * roughnessT;
    float a2B = roughnessB * roughnessB;
    
    float denom = HdotT * HdotT / a2T + HdotB * HdotB / a2B + HdotN * HdotN;
    
    return 1.0 / (PI * a2T * a2B * denom * denom);
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

// Temperature-based color shift for titanium
vec3 titaniumTemperatureShift(vec3 color, float temp) {
    // Titanium shows color changes at high temperatures
    float normalizedTemp = (temp - 20.0) / 500.0; // Up to 520°C
    
    if (normalizedTemp > 0.5) {
        // High temperature: blue/purple oxidation
        vec3 oxideColor = vec3(0.4, 0.6, 1.0);
        return mix(color, oxideColor, (normalizedTemp - 0.5) * 2.0);
    } else {
        // Normal temperature range
        return color;
    }
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 T = normalize(vTangent);
    vec3 B = normalize(vBitangent);
    
    // Apply surface finish
    vec3 surfaceNormal;
    if (finishType == 0) {
        surfaceNormal = brushedFinish(vUv);
    } else if (finishType == 1) {
        surfaceNormal = polishedFinish(vUv);
    } else {
        surfaceNormal = sandBlastFinish(vUv);
    }
    
    // Transform surface normal to world space
    mat3 TBN = mat3(T, B, N);
    N = normalize(TBN * surfaceNormal);
    
    // Apply wear simulation
    N = simulateWear(N, vUv, wearLevel);
    
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // Material properties
    vec3 albedo = baseColor;
    
    // Temperature effects
    albedo = titaniumTemperatureShift(albedo, temperature);
    
    // Pressure effects (minimal for solid metals)
    float pressureEffect = (airPressure - 1013.0) / 10000.0;
    albedo *= 1.0 + pressureEffect * 0.01;
    
    // PBR calculations
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metalness);
    
    // Adjust roughness based on finish and wear
    float effectiveRoughness = roughness;
    if (finishType == 1) effectiveRoughness *= 0.3; // Polished
    if (finishType == 2) effectiveRoughness *= 2.0; // Sandblasted
    effectiveRoughness = mix(effectiveRoughness, effectiveRoughness * 0.5, wearLevel);
    
    // Anisotropic BRDF for brushed finish
    float NDF;
    if (finishType == 0 && anisotropy > 0.01) {
        NDF = DistributionGGX_Aniso(N, H, T, B, effectiveRoughness, anisotropy);
    } else {
        float a = effectiveRoughness * effectiveRoughness;
        float a2 = a * a;
        float NdotH = max(dot(N, H), 0.0);
        float NdotH2 = NdotH * NdotH;
        
        float num = a2;
        float denom = (NdotH2 * (a2 - 1.0) + 1.0);
        denom = PI * denom * denom;
        
        NDF = num / denom;
    }
    
    float G = GeometrySmith(N, V, L, effectiveRoughness);
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
    vec3 envSpecular = envColor * F * (1.0 - effectiveRoughness);
    
    // Combine lighting
    vec3 color = Lo + envSpecular * 0.5;
    
    // Tone mapping and gamma correction
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// Orange Accent Material Fragment Shader
const orangeAccentFragmentShader = `
precision highp float;

uniform vec3 cameraPosition;
uniform float time;
uniform float temperature;

// Material properties
uniform vec3 baseColor; // Orange color
uniform float roughness;
uniform float metalness;
uniform float emissionStrength;

// Lighting
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform samplerCube envMap;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

const float PI = 3.14159265359;

// Same PBR functions as above...
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

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // Orange accent material
    vec3 albedo = baseColor;
    
    // Temperature affects emission
    float tempEffect = (temperature - 20.0) / 100.0;
    float emission = emissionStrength * (1.0 + tempEffect * 0.5);
    
    // PBR calculations
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metalness);
    
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
    
    // Add emission
    vec3 emissionColor = albedo * emission;
    
    // Combine lighting
    vec3 color = Lo + envSpecular * 0.3 + emissionColor;
    
    // Tone mapping and gamma correction
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
`;

// Green Accent Material Fragment Shader
const greenAccentFragmentShader = `
precision highp float;

uniform vec3 cameraPosition;
uniform float time;
uniform float temperature;

// Material properties
uniform vec3 baseColor; // Green color
uniform float roughness;
uniform float metalness;
uniform float emissionStrength;

// Lighting
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform samplerCube envMap;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

const float PI = 3.14159265359;

// Same PBR functions as orange accent...
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

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // Green accent material
    vec3 albedo = baseColor;
    
    // Temperature affects emission
    float tempEffect = (temperature - 20.0) / 100.0;
    float emission = emissionStrength * (1.0 + tempEffect * 0.5);
    
    // PBR calculations
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metalness);
    
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
    
    // Add emission
    vec3 emissionColor = albedo * emission;
    
    // Combine lighting
    vec3 color = Lo + envSpecular * 0.3 + emissionColor;
    
    // Tone mapping and gamma correction
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
`;