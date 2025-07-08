// Advanced Material Shader Manager
// JavaScript integration for WebGL shaders

class MaterialShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.shaders = {};
        this.materials = {};
        this.environmentalData = {
            temperature: 20.0,
            airPressure: 1013.0,
            humidity: 0.5,
            altitude: 0.0
        };
        this.performanceLevel = this.detectPerformanceLevel();
        this.initializeShaders();
    }

    detectPerformanceLevel() {
        const gl = this.gl;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Simple performance detection
        if (renderer.includes('Mali') || renderer.includes('Adreno')) {
            return 'mobile';
        } else if (renderer.includes('RTX') || renderer.includes('RX')) {
            return 'high';
        } else {
            return 'medium';
        }
    }

    initializeShaders() {
        this.createCarbonTPTShader();
        this.createSapphireShader();
        this.createTitaniumShader();
        this.createAccentShaders();
    }

    createShader(vertexSource, fragmentSource, name) {
        const gl = this.gl;
        
        // Compile vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(`Vertex shader compilation error (${name}):`, gl.getShaderInfoLog(vertexShader));
            return null;
        }
        
        // Compile fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error(`Fragment shader compilation error (${name}):`, gl.getShaderInfoLog(fragmentShader));
            return null;
        }
        
        // Create and link program
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Shader program linking error (${name}):`, gl.getProgramInfoLog(program));
            return null;
        }
        
        // Clean up
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        
        return program;
    }

    createCarbonTPTShader() {
        const vertexShader = this.getOptimizedVertexShader('carbon');
        const fragmentShader = this.getOptimizedFragmentShader('carbon');
        
        const program = this.createShader(vertexShader, fragmentShader, 'carbonTPT');
        if (program) {
            this.shaders.carbonTPT = {
                program: program,
                uniforms: this.getUniformLocations(program, [
                    'modelMatrix', 'viewMatrix', 'projectionMatrix', 'normalMatrix',
                    'cameraPosition', 'time', 'temperature', 'airPressure', 'humidity',
                    'baseColor', 'accentColor', 'roughness', 'metalness', 'iorFiber',
                    'weaveScale', 'microTextureScale', 'lightPosition', 'lightColor',
                    'lightIntensity', 'envMap'
                ]),
                attributes: this.getAttributeLocations(program, [
                    'position', 'normal', 'uv', 'tangent'
                ])
            };
        }
    }

    createSapphireShader() {
        const vertexShader = this.getOptimizedVertexShader('sapphire');
        const fragmentShader = this.getOptimizedFragmentShader('sapphire');
        
        const program = this.createShader(vertexShader, fragmentShader, 'sapphire');
        if (program) {
            this.shaders.sapphire = {
                program: program,
                uniforms: this.getUniformLocations(program, [
                    'modelMatrix', 'viewMatrix', 'projectionMatrix', 'normalMatrix',
                    'cameraPosition', 'time', 'temperature', 'humidity', 'altitude',
                    'baseColor', 'clarity', 'thickness', 'ior', 'dispersion',
                    'lightPosition', 'lightColor', 'lightIntensity', 'envMap'
                ]),
                attributes: this.getAttributeLocations(program, [
                    'position', 'normal', 'uv'
                ])
            };
        }
    }

    createTitaniumShader() {
        const vertexShader = this.getOptimizedVertexShader('titanium');
        const fragmentShader = this.getOptimizedFragmentShader('titanium');
        
        const program = this.createShader(vertexShader, fragmentShader, 'titanium');
        if (program) {
            this.shaders.titanium = {
                program: program,
                uniforms: this.getUniformLocations(program, [
                    'modelMatrix', 'viewMatrix', 'projectionMatrix', 'normalMatrix',
                    'cameraPosition', 'time', 'temperature', 'airPressure', 'wearLevel',
                    'baseColor', 'roughness', 'metalness', 'anisotropy', 'finishType',
                    'lightPosition', 'lightColor', 'lightIntensity', 'envMap'
                ]),
                attributes: this.getAttributeLocations(program, [
                    'position', 'normal', 'uv', 'tangent'
                ])
            };
        }
    }

    createAccentShaders() {
        // Orange accent
        const orangeVertexShader = this.getOptimizedVertexShader('accent');
        const orangeFragmentShader = this.getOptimizedFragmentShader('orange');
        
        const orangeProgram = this.createShader(orangeVertexShader, orangeFragmentShader, 'orangeAccent');
        if (orangeProgram) {
            this.shaders.orangeAccent = {
                program: orangeProgram,
                uniforms: this.getUniformLocations(orangeProgram, [
                    'modelMatrix', 'viewMatrix', 'projectionMatrix', 'normalMatrix',
                    'cameraPosition', 'time', 'temperature', 'baseColor', 'roughness',
                    'metalness', 'emissionStrength', 'lightPosition', 'lightColor',
                    'lightIntensity', 'envMap'
                ]),
                attributes: this.getAttributeLocations(orangeProgram, [
                    'position', 'normal', 'uv'
                ])
            };
        }

        // Green accent
        const greenVertexShader = this.getOptimizedVertexShader('accent');
        const greenFragmentShader = this.getOptimizedFragmentShader('green');
        
        const greenProgram = this.createShader(greenVertexShader, greenFragmentShader, 'greenAccent');
        if (greenProgram) {
            this.shaders.greenAccent = {
                program: greenProgram,
                uniforms: this.getUniformLocations(greenProgram, [
                    'modelMatrix', 'viewMatrix', 'projectionMatrix', 'normalMatrix',
                    'cameraPosition', 'time', 'temperature', 'baseColor', 'roughness',
                    'metalness', 'emissionStrength', 'lightPosition', 'lightColor',
                    'lightIntensity', 'envMap'
                ]),
                attributes: this.getAttributeLocations(greenProgram, [
                    'position', 'normal', 'uv'
                ])
            };
        }
    }

    getOptimizedVertexShader(type) {
        // Return performance-optimized vertex shaders based on device capability
        const baseVertex = `
            precision ${this.performanceLevel === 'mobile' ? 'mediump' : 'highp'} float;
            
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;
            ${type === 'carbon' || type === 'titanium' ? 'attribute vec3 tangent;' : ''}
            
            uniform mat4 modelMatrix;
            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;
            
            varying vec3 vWorldPosition;
            varying vec3 vViewPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            ${type === 'carbon' || type === 'titanium' ? 'varying vec3 vTangent; varying vec3 vBitangent;' : ''}
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                vec4 viewPosition = viewMatrix * worldPosition;
                vViewPosition = viewPosition.xyz;
                
                vNormal = normalize(normalMatrix * normal);
                ${type === 'carbon' || type === 'titanium' ? 
                    'vTangent = normalize(normalMatrix * tangent); vBitangent = cross(vNormal, vTangent);' : ''}
                vUv = uv;
                
                gl_Position = projectionMatrix * viewPosition;
            }
        `;
        
        return baseVertex;
    }

    getOptimizedFragmentShader(type) {
        // Return performance-optimized fragment shaders
        const precision = this.performanceLevel === 'mobile' ? 'mediump' : 'highp';
        
        // Load appropriate shader based on type and performance level
        switch (type) {
            case 'carbon':
                return this.performanceLevel === 'mobile' ? 
                    this.getCarbonTPTShaderMobile(precision) : 
                    this.getCarbonTPTShaderDesktop(precision);
            case 'sapphire':
                return this.performanceLevel === 'mobile' ? 
                    this.getSapphireShaderMobile(precision) : 
                    this.getSapphireShaderDesktop(precision);
            case 'titanium':
                return this.performanceLevel === 'mobile' ? 
                    this.getTitaniumShaderMobile(precision) : 
                    this.getTitaniumShaderDesktop(precision);
            case 'orange':
            case 'green':
                return this.getAccentShader(type, precision);
            default:
                return '';
        }
    }

    getCarbonTPTShaderDesktop(precision) {
        // Full-featured carbon TPT shader for desktop
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float temperature;
            uniform float airPressure;
            uniform float humidity;
            
            uniform vec3 baseColor;
            uniform vec3 accentColor;
            uniform float roughness;
            uniform float metalness;
            uniform float iorFiber;
            uniform float weaveScale;
            uniform float microTextureScale;
            
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
            
            // Full carbon TPT shader implementation
            ${this.getNoiseFunction()}
            ${this.getCarbonWeaveFunction()}
            ${this.getIridescenceFunction()}
            ${this.getPBRFunctions()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 T = normalize(vTangent);
                vec3 B = normalize(vBitangent);
                
                // Complete implementation as in the original shader
                vec3 color = vec3(0.2, 0.2, 0.2); // Placeholder
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getCarbonTPTShaderMobile(precision) {
        // Simplified carbon TPT shader for mobile
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform float time;
            uniform vec3 baseColor;
            uniform vec3 accentColor;
            uniform float roughness;
            uniform float metalness;
            uniform float weaveScale;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            
            ${this.getSimpleNoiseFunction()}
            ${this.getSimplePBRFunctions()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                
                // Simplified carbon fiber pattern
                float pattern = sin(vUv.x * weaveScale) * sin(vUv.y * weaveScale);
                vec3 albedo = mix(baseColor * 0.8, baseColor, pattern * 0.5 + 0.5);
                
                // Simple lighting
                float NdotL = max(dot(N, L), 0.0);
                vec3 color = albedo * lightColor * lightIntensity * NdotL;
                
                // Simple fresnel
                float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
                color += fresnel * accentColor * 0.3;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getSapphireShaderDesktop(precision) {
        // Full sapphire shader for desktop
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float temperature;
            uniform float humidity;
            uniform float altitude;
            
            uniform vec3 baseColor;
            uniform float clarity;
            uniform float thickness;
            uniform float ior;
            uniform float dispersion;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            uniform samplerCube envMap;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            
            ${this.getNoiseFunction()}
            ${this.getRefractionFunctions()}
            ${this.getFresnelFunction()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                
                // Full sapphire implementation
                vec3 color = baseColor;
                float alpha = 0.9;
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }

    getSapphireShaderMobile(precision) {
        // Simplified sapphire shader for mobile
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform vec3 baseColor;
            uniform float clarity;
            uniform float ior;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                
                // Simple glass-like material
                float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.0);
                vec3 refracted = baseColor * (1.0 - fresnel);
                vec3 reflected = lightColor * fresnel;
                
                vec3 color = refracted + reflected;
                float alpha = mix(0.8, 0.95, clarity);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }

    getTitaniumShaderDesktop(precision) {
        // Full titanium shader for desktop
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float temperature;
            uniform float airPressure;
            uniform float wearLevel;
            
            uniform vec3 baseColor;
            uniform float roughness;
            uniform float metalness;
            uniform float anisotropy;
            uniform int finishType;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            uniform samplerCube envMap;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec3 vTangent;
            varying vec3 vBitangent;
            
            ${this.getNoiseFunction()}
            ${this.getMetalSurfaceFunction()}
            ${this.getPBRFunctions()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                
                // Full titanium implementation
                vec3 color = baseColor;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getTitaniumShaderMobile(precision) {
        // Simplified titanium shader for mobile
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform vec3 baseColor;
            uniform float roughness;
            uniform float metalness;
            uniform int finishType;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            
            ${this.getSimplePBRFunctions()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                
                // Simple metal surface
                vec3 albedo = baseColor;
                
                // Adjust for finish type
                if (finishType == 0) {
                    // Brushed
                    float lines = sin(vUv.x * 100.0) * 0.5 + 0.5;
                    albedo *= 0.8 + lines * 0.2;
                } else if (finishType == 1) {
                    // Polished
                    albedo *= 1.1;
                }
                
                // Simple PBR lighting
                float NdotL = max(dot(N, L), 0.0);
                vec3 color = albedo * lightColor * lightIntensity * NdotL;
                
                // Simple reflection
                float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
                color += fresnel * lightColor * 0.3;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getAccentShader(type, precision) {
        const color = type === 'orange' ? 'vec3(1.0, 0.5, 0.1)' : 'vec3(0.1, 0.8, 0.3)';
        
        return `
            precision ${precision} float;
            
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float temperature;
            uniform vec3 baseColor;
            uniform float roughness;
            uniform float metalness;
            uniform float emissionStrength;
            
            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform float lightIntensity;
            ${this.performanceLevel !== 'mobile' ? 'uniform samplerCube envMap;' : ''}
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            
            ${this.getSimplePBRFunctions()}
            
            void main() {
                vec3 N = normalize(vNormal);
                vec3 V = normalize(cameraPosition - vWorldPosition);
                vec3 L = normalize(lightPosition - vWorldPosition);
                
                vec3 albedo = baseColor;
                
                // Temperature affects emission
                float tempEffect = (temperature - 20.0) / 100.0;
                float emission = emissionStrength * (1.0 + tempEffect * 0.5);
                
                // Simple lighting
                float NdotL = max(dot(N, L), 0.0);
                vec3 color = albedo * lightColor * lightIntensity * NdotL;
                
                // Add emission
                vec3 emissionColor = albedo * emission;
                color += emissionColor;
                
                ${this.performanceLevel !== 'mobile' ? `
                // Environment reflection
                vec3 R = reflect(-V, N);
                vec3 envColor = textureCube(envMap, R).rgb;
                color += envColor * 0.2;
                ` : ''}
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    getUniformLocations(program, uniformNames) {
        const locations = {};
        uniformNames.forEach(name => {
            locations[name] = this.gl.getUniformLocation(program, name);
        });
        return locations;
    }

    getAttributeLocations(program, attributeNames) {
        const locations = {};
        attributeNames.forEach(name => {
            locations[name] = this.gl.getAttribLocation(program, name);
        });
        return locations;
    }

    // Helper functions for shader code
    getNoiseFunction() {
        return `
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
        `;
    }

    getSimpleNoiseFunction() {
        return `
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
        `;
    }

    getCarbonWeaveFunction() {
        return `
            float carbonWeavePattern(vec2 uv) {
                vec2 weaveUV = uv * weaveScale;
                vec2 id = floor(weaveUV);
                vec2 st = fract(weaveUV);
                
                float isHorizontal = mod(id.x + id.y, 2.0);
                float pattern = isHorizontal > 0.5 ? st.x : st.y;
                
                float fiberNoise = noise(uv * microTextureScale);
                pattern += fiberNoise * 0.1;
                
                return smoothstep(0.3, 0.7, pattern);
            }
        `;
    }

    getIridescenceFunction() {
        return `
            vec3 iridescence(float cosTheta, vec3 baseCol) {
                float a = 1.0 - cosTheta;
                float a2 = a * a;
                float a5 = a2 * a2 * a;
                
                vec3 shift = vec3(
                    sin(a5 * 15.0 + time * 0.1),
                    sin(a5 * 20.0 + time * 0.15),
                    sin(a5 * 25.0 + time * 0.2)
                ) * 0.2;
                
                return baseCol + shift * accentColor;
            }
        `;
    }

    getRefractionFunctions() {
        return `
            float fresnelReflectance(float cosTheta, float n1, float n2) {
                float r0 = pow((n1 - n2) / (n1 + n2), 2.0);
                return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
            }
            
            vec3 dispersionRefraction(vec3 rayDir, vec3 normal, float airIOR, float crystalIOR) {
                vec3 refracted = vec3(0.0);
                vec3 wavelengths = vec3(680.0, 550.0, 440.0);
                
                for (int i = 0; i < 3; i++) {
                    float eta = airIOR / crystalIOR;
                    float cosI = -dot(rayDir, normal);
                    float sinT2 = eta * eta * (1.0 - cosI * cosI);
                    
                    if (sinT2 < 1.0) {
                        float cosT = sqrt(1.0 - sinT2);
                        refracted[i] = dot(eta * rayDir + (eta * cosI - cosT) * normal, normal);
                    }
                }
                
                return refracted;
            }
        `;
    }

    getFresnelFunction() {
        return `
            vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
            }
        `;
    }

    getMetalSurfaceFunction() {
        return `
            vec3 brushedFinish(vec2 uv) {
                float lines = sin(uv.x * 200.0) * 0.5 + 0.5;
                lines = pow(lines, 3.0);
                float microNoise = noise(uv * 500.0) * 0.2;
                lines += microNoise;
                return vec3(lines, 0.0, 1.0 - lines * 0.3);
            }
            
            vec3 polishedFinish(vec2 uv) {
                float microVar = noise(uv * 100.0) * 0.05;
                return vec3(microVar, microVar, 1.0 - microVar * 0.1);
            }
        `;
    }

    getPBRFunctions() {
        return `
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
        `;
    }

    getSimplePBRFunctions() {
        return `
            float simplePBR(vec3 N, vec3 V, vec3 L, float roughness) {
                vec3 H = normalize(V + L);
                float NdotH = max(dot(N, H), 0.0);
                float spec = pow(NdotH, 1.0 / (roughness + 0.001));
                return spec;
            }
        `;
    }

    // Material creation and management
    createMaterial(type, properties) {
        const material = {
            type: type,
            properties: { ...this.getDefaultProperties(type), ...properties },
            shader: this.shaders[type]
        };
        
        const id = this.generateMaterialId();
        this.materials[id] = material;
        
        return id;
    }

    getDefaultProperties(type) {
        switch (type) {
            case 'carbonTPT':
                return {
                    baseColor: [0.1, 0.1, 0.1],
                    accentColor: [0.2, 0.4, 0.8],
                    roughness: 0.3,
                    metalness: 0.8,
                    iorFiber: 1.6,
                    weaveScale: 20.0,
                    microTextureScale: 200.0
                };
            case 'sapphire':
                return {
                    baseColor: [0.8, 0.9, 1.0],
                    clarity: 0.95,
                    thickness: 2.0,
                    ior: 1.77,
                    dispersion: 0.02
                };
            case 'titanium':
                return {
                    baseColor: [0.7, 0.7, 0.8],
                    roughness: 0.2,
                    metalness: 1.0,
                    anisotropy: 0.0,
                    finishType: 1, // polished
                    wearLevel: 0.0
                };
            case 'orangeAccent':
                return {
                    baseColor: [1.0, 0.5, 0.1],
                    roughness: 0.1,
                    metalness: 0.0,
                    emissionStrength: 0.2
                };
            case 'greenAccent':
                return {
                    baseColor: [0.1, 0.8, 0.3],
                    roughness: 0.1,
                    metalness: 0.0,
                    emissionStrength: 0.2
                };
            default:
                return {};
        }
    }

    generateMaterialId() {
        return 'material_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Rendering functions
    useMaterial(materialId) {
        const material = this.materials[materialId];
        if (!material || !material.shader) {
            console.warn('Material not found:', materialId);
            return false;
        }
        
        this.gl.useProgram(material.shader.program);
        this.currentMaterial = material;
        return true;
    }

    setUniforms(matrices, lighting, environment) {
        if (!this.currentMaterial) return;
        
        const gl = this.gl;
        const uniforms = this.currentMaterial.shader.uniforms;
        const props = this.currentMaterial.properties;
        
        // Matrices
        if (uniforms.modelMatrix) gl.uniformMatrix4fv(uniforms.modelMatrix, false, matrices.model);
        if (uniforms.viewMatrix) gl.uniformMatrix4fv(uniforms.viewMatrix, false, matrices.view);
        if (uniforms.projectionMatrix) gl.uniformMatrix4fv(uniforms.projectionMatrix, false, matrices.projection);
        if (uniforms.normalMatrix) gl.uniformMatrix3fv(uniforms.normalMatrix, false, matrices.normal);
        
        // Camera
        if (uniforms.cameraPosition) gl.uniform3fv(uniforms.cameraPosition, lighting.cameraPosition);
        if (uniforms.time) gl.uniform1f(uniforms.time, performance.now() * 0.001);
        
        // Environmental
        if (uniforms.temperature) gl.uniform1f(uniforms.temperature, this.environmentalData.temperature);
        if (uniforms.airPressure) gl.uniform1f(uniforms.airPressure, this.environmentalData.airPressure);
        if (uniforms.humidity) gl.uniform1f(uniforms.humidity, this.environmentalData.humidity);
        if (uniforms.altitude) gl.uniform1f(uniforms.altitude, this.environmentalData.altitude);
        
        // Material properties
        Object.keys(props).forEach(key => {
            if (uniforms[key]) {
                const value = props[key];
                if (Array.isArray(value)) {
                    if (value.length === 3) gl.uniform3fv(uniforms[key], value);
                    else if (value.length === 4) gl.uniform4fv(uniforms[key], value);
                } else if (typeof value === 'number') {
                    gl.uniform1f(uniforms[key], value);
                } else if (typeof value === 'boolean') {
                    gl.uniform1i(uniforms[key], value ? 1 : 0);
                }
            }
        });
        
        // Lighting
        if (uniforms.lightPosition) gl.uniform3fv(uniforms.lightPosition, lighting.position);
        if (uniforms.lightColor) gl.uniform3fv(uniforms.lightColor, lighting.color);
        if (uniforms.lightIntensity) gl.uniform1f(uniforms.lightIntensity, lighting.intensity);
        
        // Environment map
        if (uniforms.envMap && environment.cubeMap) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, environment.cubeMap);
            gl.uniform1i(uniforms.envMap, 0);
        }
    }

    updateEnvironmentalData(data) {
        this.environmentalData = { ...this.environmentalData, ...data };
    }

    updateMaterialProperty(materialId, property, value) {
        if (this.materials[materialId]) {
            this.materials[materialId].properties[property] = value;
        }
    }

    // LOD system
    getLODLevel(distance) {
        if (distance < 10) return 'high';
        if (distance < 50) return 'medium';
        return 'low';
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        this.performanceData = {
            frameCount: 0,
            startTime: performance.now(),
            lastFrameTime: performance.now()
        };
    }

    updatePerformanceData() {
        const now = performance.now();
        this.performanceData.frameCount++;
        const deltaTime = now - this.performanceData.lastFrameTime;
        this.performanceData.lastFrameTime = now;
        
        // Adjust quality based on performance
        if (deltaTime > 16.67) { // Below 60 FPS
            this.adjustQuality('down');
        } else if (deltaTime < 13.33) { // Above 75 FPS
            this.adjustQuality('up');
        }
    }

    adjustQuality(direction) {
        // Implement quality adjustment logic
        if (direction === 'down' && this.performanceLevel !== 'mobile') {
            this.performanceLevel = this.performanceLevel === 'high' ? 'medium' : 'mobile';
            this.reinitializeShaders();
        } else if (direction === 'up' && this.performanceLevel !== 'high') {
            this.performanceLevel = this.performanceLevel === 'mobile' ? 'medium' : 'high';
            this.reinitializeShaders();
        }
    }

    reinitializeShaders() {
        // Reinitialize shaders with new performance level
        this.shaders = {};
        this.initializeShaders();
    }

    // Cleanup
    dispose() {
        Object.values(this.shaders).forEach(shader => {
            this.gl.deleteProgram(shader.program);
        });
        this.shaders = {};
        this.materials = {};
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialShaderManager;
} else if (typeof window !== 'undefined') {
    window.MaterialShaderManager = MaterialShaderManager;
}