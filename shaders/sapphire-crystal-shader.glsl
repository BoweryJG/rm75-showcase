// Sapphire Crystal Shader
// Vertex Shader
const sapphireVertexShader = `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;
    
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    
    gl_Position = projectionMatrix * viewPosition;
}
`;

// Fragment Shader
const sapphireFragmentShader = `
precision highp float;

uniform vec3 cameraPosition;
uniform float time;
uniform float temperature; // Celsius
uniform float humidity; // 0-1
uniform float altitude; // meters

// Material properties
uniform vec3 baseColor;
uniform float clarity; // 0-1
uniform float thickness; // mm
uniform float ior; // 1.77 for sapphire
uniform float dispersion; // Abbe number

// Lighting
uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform samplerCube envMap;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

// Constants
const float PI = 3.14159265359;
const vec3 WAVELENGTHS = vec3(680.0, 550.0, 440.0); // RGB wavelengths in nm
const float DISPERSION_FACTOR = 0.02;

// Noise for clarity variations
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

// Wavelength-dependent refractive index
float getIOR(float wavelength) {
    // Sellmeier equation for sapphire
    float B1 = 1.4313493;
    float B2 = 0.65054713;
    float B3 = 5.3414021;
    float C1 = 0.0052799261;
    float C2 = 0.0142382647;
    float C3 = 325.017834;
    
    float wl2 = wavelength * wavelength;
    float n2 = 1.0 + (B1 * wl2) / (wl2 - C1) + (B2 * wl2) / (wl2 - C2) + (B3 * wl2) / (wl2 - C3);
    
    return sqrt(n2);
}

// Fresnel equations
float fresnelReflectance(float cosTheta, float n1, float n2) {
    float r0 = pow((n1 - n2) / (n1 + n2), 2.0);
    return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
}

// Chromatic dispersion
vec3 dispersionRefraction(vec3 rayDir, vec3 normal, float airIOR, float crystalIOR) {
    vec3 refracted = vec3(0.0);
    
    for (int i = 0; i < 3; i++) {
        float wl = WAVELENGTHS[i];
        float n = getIOR(wl);
        float eta = airIOR / n;
        
        float cosI = -dot(rayDir, normal);
        float sinT2 = eta * eta * (1.0 - cosI * cosI);
        
        if (sinT2 < 1.0) {
            float cosT = sqrt(1.0 - sinT2);
            refracted[i] = dot(eta * rayDir + (eta * cosI - cosT) * normal, normal);
        }
    }
    
    return refracted;
}

// Internal reflection calculation
vec3 calculateInternalReflection(vec3 viewDir, vec3 normal, float thickness) {
    vec3 reflection = vec3(0.0);
    
    // Multiple internal reflections
    for (int bounce = 0; bounce < 3; bounce++) {
        float bounceFactor = pow(0.7, float(bounce));
        vec3 reflectedDir = reflect(viewDir, normal);
        
        // Simulate light bouncing inside crystal
        float intensity = bounceFactor * (1.0 - float(bounce) * 0.2);
        reflection += intensity * baseColor * 0.3;
    }
    
    return reflection;
}

// Environmental effects
float humidityEffect(float humidity) {
    // Higher humidity can create condensation and affect clarity
    return 1.0 - humidity * 0.1;
}

float altitudeEffect(float altitude) {
    // Higher altitude means thinner air and different light refraction
    float airDensity = exp(-altitude / 8000.0); // Scale height approximation
    return airDensity;
}

float temperatureEffect(float temp) {
    // Temperature affects crystal structure slightly
    float normalizedTemp = (temp - 20.0) / 40.0;
    return 1.0 + normalizedTemp * 0.02;
}

// Clarity variations
float clarityVariation(vec2 uv, float clarityLevel) {
    float variation = noise(uv * 100.0) * 0.2;
    float bubble = smoothstep(0.8, 1.0, noise(uv * 50.0));
    float inclusion = smoothstep(0.9, 1.0, noise(uv * 200.0)) * 0.1;
    
    return clarityLevel * (1.0 - variation - bubble - inclusion);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    vec3 L = normalize(lightPosition - vWorldPosition);
    vec3 H = normalize(V + L);
    
    // Environmental effects
    float humidityFactor = humidityEffect(humidity);
    float altitudeFactor = altitudeEffect(altitude);
    float tempFactor = temperatureEffect(temperature);
    
    // Calculate local clarity
    float localClarity = clarityVariation(vUv, clarity * humidityFactor);
    
    // Fresnel reflection
    float cosTheta = dot(N, V);
    float F = fresnelReflectance(abs(cosTheta), 1.0, ior * tempFactor);
    
    // Environment reflection
    vec3 R = reflect(-V, N);
    vec3 envColor = textureCube(envMap, R).rgb;
    
    // Chromatic dispersion
    vec3 dispersion = dispersionRefraction(-V, N, 1.0 * altitudeFactor, ior * tempFactor);
    vec3 dispersedColor = vec3(
        baseColor.r * (1.0 + dispersion.r * DISPERSION_FACTOR),
        baseColor.g * (1.0 + dispersion.g * DISPERSION_FACTOR),
        baseColor.b * (1.0 + dispersion.b * DISPERSION_FACTOR)
    );
    
    // Internal reflections
    vec3 internalReflection = calculateInternalReflection(V, N, thickness);
    
    // Transmission through crystal
    vec3 transmission = dispersedColor * (1.0 - F) * localClarity;
    
    // Reflection component
    vec3 reflection = envColor * F * localClarity;
    
    // Combine all components
    vec3 color = transmission + reflection + internalReflection;
    
    // Add subtle sparkle effect
    float sparkle = pow(max(dot(N, H), 0.0), 100.0) * localClarity;
    color += sparkle * lightColor * lightIntensity;
    
    // Atmospheric scattering at high altitude
    if (altitude > 5000.0) {
        float scatterFactor = (altitude - 5000.0) / 5000.0;
        vec3 scatterColor = vec3(0.5, 0.7, 1.0) * scatterFactor * 0.1;
        color += scatterColor;
    }
    
    // Gamma correction
    color = pow(color, vec3(1.0/2.2));
    
    // Alpha based on clarity and viewing angle
    float alpha = mix(0.9, 1.0, localClarity) * (1.0 - F * 0.5);
    
    gl_FragColor = vec4(color, alpha);
}
`;