#ifdef GL_ES
precision mediump float;
#endif

//#extension GL_OES_standard_derivatives : enable


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main( void ) {

	/*
	vec2 position = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;

	float color = 0.0;
	color += sin( position.x * cos( time / 15.0 ) * 80.0 ) + cos( position.y * cos( time / 15.0 ) * 10.0 );
	color += sin( position.y * sin( time / 10.0 ) * 40.0 ) + cos( position.x * sin( time / 25.0 ) * 40.0 );
	color += sin( position.x * sin( time / 5.0 ) * 10.0 ) + sin( position.y * sin( time / 35.0 ) * 80.0 );
	color *= sin( time / 10.0 ) * 0.5;
*/

	float _dist = distance( gl_FragCoord.xy, u_mouse);
	gl_FragColor = vec4( vec3( 30.0 / _dist ), 1.0 );
}