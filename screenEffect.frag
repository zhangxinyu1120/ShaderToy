#ifdef GL_ES
precision mediump float;
#endif

// #extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

vec2 rotate( vec2 matrix, float angle ) {
	return vec2( matrix.x*cos(radians(angle)), matrix.x*sin(radians(angle)) ) + vec2( matrix.y*-sin(radians(angle)), matrix.y*cos(radians(angle)) );
}

void main( void ) {

	vec3 rColor = vec3(0.7, 0.1, 0.3)* ((sin(u_time*50.0)*0.5 + 3.14) * 0.066);
	vec3 gColor = vec3(0.0, 0.2, 0.5);
	vec3 bColor = vec3(0.9, 0.1, 0.0) * ((cos(u_time)+1.125) * 2.0);
	vec3 yColor = vec3(0.1, 0.0, 0.0);

	vec2 position = ( gl_FragCoord.xy / u_resolution.xy ) / 4.0;
	position = gl_FragCoord.xy * 2.0 - u_resolution;
	position /= min(u_resolution.x, u_resolution.y);
	position = rotate(position, u_time);
	
	float a = sin(position.y * 1.3 - u_time * 0.1) / 1.0;
	float b = cos(position.y * 1.4 - u_time * 0.2) / 1.0;
	float c = sin(position.x * 1.5 - u_time * 0.2 + 3.14) / 2.0;
	float d = cos(position.y * 1.6 - u_time * 0.5 + 3.14) / 2.0;
	
	float e = 0.51 / abs(position.x + a);
	float f = 0.51 / abs(position.x + b);
	float g = 0.51 / abs(position.y + c);
	float h = 0.51 / abs(position.x + d);
	
	vec3 color = rColor * e * gColor * f + bColor * f * g * h * 0.01;

	
	gl_FragColor = vec4(color, 1.0);

}