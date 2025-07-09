// Performance Optimization System for Advanced Material Shaders

class PerformanceOptimizer {
    constructor(gl, shaderManager) {
        this.gl = gl;
        this.shaderManager = shaderManager;
        this.metrics = {
            frameTime: 16.67,
            averageFrameTime: 16.67,
            gpuTime: 0,
            cpuTime: 0,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0
        };
        
        this.targets = {
            targetFrameTime: 16.67, // 60 FPS
            maxFrameTime: 33.33,    // 30 FPS minimum
            memoryThreshold: 512,   // MB
            drawCallThreshold: 1000
        };
        
        this.optimizations = {
            adaptiveQuality: true,
            lodScaling: true,
            dynamicBatching: true,
            culling: true,
            shaderOptimization: true
        };
        
        this.qualitySettings = {
            ultra: { lodBias: 2, textureScale: 2.0, effectScale: 1.2 },
            high: { lodBias: 1, textureScale: 1.0, effectScale: 1.0 },
            medium: { lodBias: 0, textureScale: 0.75, effectScale: 0.7 },
            low: { lodBias: -1, textureScale: 0.5, effectScale: 0.5 },
            mobile: { lodBias: -2, textureScale: 0.25, effectScale: 0.3 }
        };
        
        this.currentQuality = 'high';
        this.lastQualityChange = 0;
        this.qualityChangeDelay = 2000; // 2 seconds
        
        this.initializePerformanceMonitoring();
    }
    
    initializePerformanceMonitoring() {
        // WebGL timer extension for GPU timing
        this.timerExt = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') ||
                       this.gl.getExtension('EXT_disjoint_timer_query');
        
        // Memory monitoring
        this.memoryInfo = performance.memory;
        
        // Frame timing
        this.frameTimeHistory = new Array(60).fill(16.67);
        this.frameIndex = 0;
        
        // GPU queries
        this.gpuQueries = [];
        this.activeQuery = null;
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
    }
    
    beginFrame() {
        this.frameStartTime = performance.now();
        this.metrics.drawCalls = 0;
        this.metrics.triangles = 0;
        
        // Start GPU timing if available
        if (this.timerExt && !this.activeQuery) {
            this.activeQuery = this.gl.createQuery();
            this.gl.beginQuery(this.timerExt.TIME_ELAPSED_EXT, this.activeQuery);
        }
    }
    
    endFrame() {
        const frameEndTime = performance.now();
        this.metrics.frameTime = frameEndTime - this.frameStartTime;
        this.metrics.cpuTime = frameEndTime - this.frameStartTime;
        
        // End GPU timing
        if (this.timerExt && this.activeQuery) {
            this.gl.endQuery(this.timerExt.TIME_ELAPSED_EXT);
            this.gpuQueries.push({
                query: this.activeQuery,
                timestamp: frameEndTime
            });
            this.activeQuery = null;
        }
        
        // Process completed GPU queries
        this.processGPUQueries();
        
        // Update frame time history
        this.frameTimeHistory[this.frameIndex] = this.metrics.frameTime;
        this.frameIndex = (this.frameIndex + 1) % this.frameTimeHistory.length;
        
        // Calculate average frame time
        this.metrics.averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
        
        // Update memory usage
        if (this.memoryInfo) {
            this.metrics.memoryUsage = this.memoryInfo.usedJSHeapSize / (1024 * 1024);
        }
        
        // Perform adaptive optimization
        this.adaptiveOptimization();
    }
    
    processGPUQueries() {
        if (!this.timerExt) return;
        
        // Check completed queries
        for (let i = this.gpuQueries.length - 1; i >= 0; i--) {
            const queryInfo = this.gpuQueries[i];
            
            if (this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE)) {
                const gpuTime = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT);
                this.metrics.gpuTime = gpuTime / 1000000; // Convert to milliseconds
                
                this.gl.deleteQuery(queryInfo.query);
                this.gpuQueries.splice(i, 1);
            }
        }
    }
    
    adaptiveOptimization() {
        if (!this.optimizations.adaptiveQuality) return;
        
        const now = performance.now();
        if (now - this.lastQualityChange < this.qualityChangeDelay) return;
        
        const avgFrameTime = this.metrics.averageFrameTime;
        const memoryUsage = this.metrics.memoryUsage;
        
        let newQuality = this.currentQuality;
        
        // Performance-based quality adjustment
        if (avgFrameTime > this.targets.maxFrameTime || memoryUsage > this.targets.memoryThreshold) {
            // Performance is poor, reduce quality
            newQuality = this.lowerQuality(this.currentQuality);
        } else if (avgFrameTime < this.targets.targetFrameTime * 0.8 && memoryUsage < this.targets.memoryThreshold * 0.7) {
            // Performance is good, increase quality
            newQuality = this.raiseQuality(this.currentQuality);
        }
        
        if (newQuality !== this.currentQuality) {
            this.setQualityLevel(newQuality);
            this.lastQualityChange = now;
            console.log(`Quality adjusted: ${this.currentQuality} -> ${newQuality} (Frame time: ${avgFrameTime.toFixed(2)}ms)`);
        }
    }
    
    lowerQuality(currentQuality) {
        const qualities = ['ultra', 'high', 'medium', 'low', 'mobile'];
        const currentIndex = qualities.indexOf(currentQuality);
        return currentIndex < qualities.length - 1 ? qualities[currentIndex + 1] : currentQuality;
    }
    
    raiseQuality(currentQuality) {
        const qualities = ['ultra', 'high', 'medium', 'low', 'mobile'];
        const currentIndex = qualities.indexOf(currentQuality);
        return currentIndex > 0 ? qualities[currentIndex - 1] : currentQuality;
    }
    
    setQualityLevel(quality) {
        this.currentQuality = quality;
        const settings = this.qualitySettings[quality];
        
        // Update shader manager performance level
        this.shaderManager.performanceLevel = quality === 'mobile' || quality === 'low' ? 'mobile' :
                                              quality === 'medium' ? 'medium' : 'high';
        
        // Apply quality settings to all materials
        this.applyQualitySettings(settings);
        
        // Reinitialize shaders if necessary
        if (quality === 'mobile' || quality === 'low') {
            this.shaderManager.reinitializeShaders();
        }
    }
    
    applyQualitySettings(settings) {
        // Apply LOD bias
        Object.values(this.shaderManager.materials).forEach(material => {
            if (material.properties.lodBias !== undefined) {
                material.properties.lodBias = settings.lodBias;
            }
        });
        
        // Apply texture scaling
        this.applyTextureScaling(settings.textureScale);
        
        // Apply effect scaling
        this.applyEffectScaling(settings.effectScale);
    }
    
    applyTextureScaling(scale) {
        // Adjust texture-related properties
        Object.values(this.shaderManager.materials).forEach(material => {
            if (material.properties.weaveScale) {
                material.properties.weaveScale *= scale;
            }
            if (material.properties.microTextureScale) {
                material.properties.microTextureScale *= scale;
            }
        });
    }
    
    applyEffectScaling(scale) {
        // Adjust effect intensities
        Object.values(this.shaderManager.materials).forEach(material => {
            if (material.properties.iridescenceStrength) {
                material.properties.iridescenceStrength *= scale;
            }
            if (material.properties.emissionStrength) {
                material.properties.emissionStrength *= scale;
            }
            if (material.properties.dispersion) {
                material.properties.dispersion *= scale;
            }
        });
    }
    
    // LOD System
    calculateLOD(distance, objectSize = 1.0) {
        if (!this.optimizations.lodScaling) return 'high';
        
        const quality = this.qualitySettings[this.currentQuality];
        const adjustedDistance = distance / (objectSize * (1 + quality.lodBias * 0.5));
        
        if (adjustedDistance < 10) return 'high';
        if (adjustedDistance < 50) return 'medium';
        if (adjustedDistance < 200) return 'low';
        return 'minimal';
    }
    
    // Frustum Culling
    isInFrustum(object, camera) {
        if (!this.optimizations.culling) return true;
        
        // Simple frustum culling implementation
        const position = object.position;
        const distance = this.calculateDistance(position, camera.position);
        
        // Simple distance-based culling
        return distance < this.targets.cullingDistance;
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1[0] - pos2[0];
        const dy = pos1[1] - pos2[1];
        const dz = pos1[2] - pos2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Shader Optimization
    optimizeShaderForDevice() {
        const gl = this.gl;
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        
        let optimizations = {
            reducePrecision: false,
            simplifyNoise: false,
            reduceLoops: false,
            disableComplexEffects: false
        };
        
        // Mobile GPU detection
        if (renderer.includes('Mali') || renderer.includes('Adreno') || renderer.includes('PowerVR')) {
            optimizations = {
                reducePrecision: true,
                simplifyNoise: true,
                reduceLoops: true,
                disableComplexEffects: true
            };
        }
        
        // Intel integrated graphics
        if (renderer.includes('Intel')) {
            optimizations.reduceLoops = true;
            optimizations.simplifyNoise = true;
        }
        
        return optimizations;
    }
    
    // Memory Management
    manageMemory() {
        if (this.metrics.memoryUsage > this.targets.memoryThreshold) {
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Reduce texture cache
            this.reduceTextureCache();
            
            // Reduce geometry LOD
            this.reduceGeometryLOD();
        }
    }
    
    reduceTextureCache() {
        // Implementation would reduce texture resolution or remove unused textures
        console.log('Reducing texture cache due to memory pressure');
    }
    
    reduceGeometryLOD() {
        // Implementation would reduce geometry detail
        console.log('Reducing geometry LOD due to memory pressure');
    }
    
    // Performance Monitoring UI
    getPerformanceReport() {
        return {
            fps: Math.round(1000 / this.metrics.averageFrameTime),
            frameTime: this.metrics.frameTime.toFixed(2),
            averageFrameTime: this.metrics.averageFrameTime.toFixed(2),
            gpuTime: this.metrics.gpuTime.toFixed(2),
            cpuTime: this.metrics.cpuTime.toFixed(2),
            memoryUsage: this.metrics.memoryUsage.toFixed(1),
            quality: this.currentQuality,
            drawCalls: this.metrics.drawCalls,
            triangles: this.metrics.triangles
        };
    }
    
    // Profiling Tools
    startProfiling() {
        this.profilingData = {
            startTime: performance.now(),
            frames: [],
            totalFrames: 0
        };
    }
    
    addProfilingFrame() {
        if (!this.profilingData) return;
        
        this.profilingData.frames.push({
            frameTime: this.metrics.frameTime,
            gpuTime: this.metrics.gpuTime,
            cpuTime: this.metrics.cpuTime,
            memoryUsage: this.metrics.memoryUsage,
            quality: this.currentQuality
        });
        
        this.profilingData.totalFrames++;
    }
    
    getProfilingReport() {
        if (!this.profilingData) return null;
        
        const frames = this.profilingData.frames;
        const totalTime = performance.now() - this.profilingData.startTime;
        
        const avgFrameTime = frames.reduce((sum, frame) => sum + frame.frameTime, 0) / frames.length;
        const avgGPUTime = frames.reduce((sum, frame) => sum + frame.gpuTime, 0) / frames.length;
        const avgCPUTime = frames.reduce((sum, frame) => sum + frame.cpuTime, 0) / frames.length;
        const avgMemory = frames.reduce((sum, frame) => sum + frame.memoryUsage, 0) / frames.length;
        
        const minFrameTime = Math.min(...frames.map(f => f.frameTime));
        const maxFrameTime = Math.max(...frames.map(f => f.frameTime));
        
        return {
            totalTime: totalTime,
            totalFrames: this.profilingData.totalFrames,
            avgFPS: Math.round(1000 / avgFrameTime),
            avgFrameTime: avgFrameTime.toFixed(2),
            minFrameTime: minFrameTime.toFixed(2),
            maxFrameTime: maxFrameTime.toFixed(2),
            avgGPUTime: avgGPUTime.toFixed(2),
            avgCPUTime: avgCPUTime.toFixed(2),
            avgMemoryUsage: avgMemory.toFixed(1),
            qualityDistribution: this.getQualityDistribution(frames)
        };
    }
    
    getQualityDistribution(frames) {
        const distribution = {};
        frames.forEach(frame => {
            distribution[frame.quality] = (distribution[frame.quality] || 0) + 1;
        });
        
        Object.keys(distribution).forEach(key => {
            distribution[key] = ((distribution[key] / frames.length) * 100).toFixed(1) + '%';
        });
        
        return distribution;
    }
    
    // Benchmark System
    runBenchmark(duration = 10000) {
        return new Promise((resolve) => {
            this.startProfiling();
            
            setTimeout(() => {
                const report = this.getProfilingReport();
                resolve(report);
            }, duration);
        });
    }
    
    // Device-specific optimizations
    applyDeviceOptimizations() {
        const gl = this.gl;
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
        
        // Adjust limits based on device capabilities
        if (maxTextureSize < 2048) {
            this.setQualityLevel('mobile');
        } else if (maxTextureSize < 4096) {
            this.setQualityLevel('low');
        }
        
        // WebGL extensions
        const extensions = [
            'EXT_texture_filter_anisotropic',
            'OES_texture_float',
            'OES_texture_half_float',
            'WEBGL_depth_texture',
            'OES_standard_derivatives'
        ];
        
        this.supportedExtensions = {};
        extensions.forEach(ext => {
            this.supportedExtensions[ext] = !!gl.getExtension(ext);
        });
        
        // Adjust features based on extension support
        if (!this.supportedExtensions['EXT_texture_filter_anisotropic']) {
            // Disable anisotropic filtering
            this.optimizations.anisotropicFiltering = false;
        }
        
        if (!this.supportedExtensions['OES_standard_derivatives']) {
            // Disable effects that require derivatives
            this.optimizations.normalMapping = false;
        }
    }
    
    // Cleanup
    dispose() {
        // Clean up GPU queries
        this.gpuQueries.forEach(queryInfo => {
            this.gl.deleteQuery(queryInfo.query);
        });
        
        if (this.activeQuery) {
            this.gl.deleteQuery(this.activeQuery);
        }
        
        this.gpuQueries = [];
        this.activeQuery = null;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
}