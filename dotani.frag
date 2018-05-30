#ifdef GL_ES
precision mediump float;
#endif

// uniform float time;
// uniform vec2 resolution;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main( void ) {
    
    float sum = 0.0;
    float size = u_resolution.x / 12.0;
    float g = 0.93;
    int num = 100;
    for (int i = 0; i < 1; ++i) {
        vec2 position = u_resolution / 2.0;
        position.x += sin(u_time / 3.0 + 1.0 * float(i)) * u_resolution.x * 0.25;
        position.y += tan(u_time / 556.0 + (2.0 + sin(u_time) * 0.01) * float(i)) * u_resolution.y * 0.25;
        
        float dist = length(gl_FragCoord.xy - position);
        
        sum += size / pow(dist, g);
    }
    
    vec4 color = vec4(0,0,1,1);
    float val = sum / float(num);
    color = vec4(0, val*0.5, val, 1);
    
    gl_FragColor = vec4(color);
}
