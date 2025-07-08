// Sapphire Crystal Shader for Richard Mille Watch Glass
// Realistic glass with refraction, reflection, and transparency

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
varying vec3 vReflect;
varying vec3 vRefract;

void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = worldPosition.xyz;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    
    // Calculate reflection and refraction vectors
    float refractionRatio = 1.0 / 1.77; // Sapphire refractive index ≈ 1.77
    vReflect = reflect(-vViewDirection, vNormal);
    vRefract = refract(-vViewDirection, vNormal, refractionRatio);
    
    gl_Position = projectionMatrix * worldPosition;
}

// Fragment Shader
precision highp float;

uniform float time;
uniform float opacity;
uniform float clarity;
uniform float thickness;
uniform vec3 tintColor;
uniform samplerCube envMap;
uniform sampler2D backgroundTexture;
uniform vec2 resolution;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewDirection;
varying vec3 vReflect;
varying vec3 vRefract;

// Noise function for subtle surface imperfections
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
        mix(
            mix(dot(hash(i + vec3(0,0,0)), f - vec3(0,0,0)),
                dot(hash(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
            mix(dot(hash(i + vec3(0,1,0)), f - vec3(0,1,0)),
                dot(hash(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
        mix(
            mix(dot(hash(i + vec3(0,0,1)), f - vec3(0,0,1)),
                dot(hash(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
            mix(dot(hash(i + vec3(0,1,1)), f - vec3(0,1,1)),
                dot(hash(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
}

vec3 hash(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// Fresnel calculation for realistic reflection
float fresnel(float cosTheta, float n1, float n2) {
    float F0 = pow((n1 - n2) / (n1 + n2), 2.0);
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// Chromatic dispersion effect
vec3 chromaticDispersion(vec3 refractDir, float intensity) {
    float redIOR = 1.76;
    float greenIOR = 1.77;
    float blueIOR = 1.78;
    
    vec3 redRefract = refract(-vViewDirection, vNormal, 1.0 / redIOR);
    vec3 greenRefract = refract(-vViewDirection, vNormal, 1.0 / greenIOR);
    vec3 blueRefract = refract(-vViewDirection, vNormal, 1.0 / blueIOR);
    
    float red = textureCube(envMap, redRefract).r;
    float green = textureCube(envMap, greenRefract).g;
    float blue = textureCube(envMap, blueRefract).b;
    
    return vec3(red, green, blue) * intensity;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDirection);
    
    // Add subtle surface imperfections
    float imperfections = noise(vPosition * 100.0) * 0.02 * (1.0 - clarity);
    normal += imperfections;
    normal = normalize(normal);
    
    // Calculate Fresnel factor
    float cosTheta = abs(dot(viewDir, normal));
    float fresnelFactor = fresnel(cosTheta, 1.0, 1.77);
    
    // Environment reflection
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 reflectColor = textureCube(envMap, reflectDir).rgb;
    
    // Environment refraction with chromatic dispersion
    vec3 refractColor;
    if (length(vRefract) > 0.0) {
        refractColor = chromaticDispersion(vRefract, 0.3);
    } else {
        // Total internal reflection
        refractColor = reflectColor;
    }
    
    // Background distortion through glass
    vec2 screenPos = gl_FragCoord.xy / resolution;
    vec2 distortion = normal.xy * 0.1 * thickness;
    vec3 backgroundRefract = texture2D(backgroundTexture, screenPos + distortion).rgb;
    
    // Mix refracted environment and background
    refractColor = mix(refractColor, backgroundRefract, 0.7);
    
    // Apply tint color
    refractColor *= tintColor;
    
    // Combine reflection and refraction
    vec3 color = mix(refractColor, reflectColor, fresnelFactor);
    
    // Add subtle blue tint characteristic of sapphire
    color += vec3(0.0, 0.02, 0.05) * clarity;
    
    // Edge darkening for realistic glass effect
    float edgeFactor = 1.0 - abs(cosTheta);
    color *= 1.0 - edgeFactor * 0.3;
    
    // Final opacity calculation
    float finalOpacity = opacity * (0.85 + fresnelFactor * 0.15);
    
    gl_FragColor = vec4(color, finalOpacity);
}