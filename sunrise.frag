/** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** */
// 2D graphic resembling a sunrise on the sea: 
// previous versions: new version, size of Sun variable corrected, added glittering to light reflection effect, sun size adapted to position
// ver.000.a00-rev.04: clouds added on the sky; sky color corrected after the clouds position, clouds are darker when in front of Sun; 
//     a red teint added to the horizon when the Sun position reaches it;
// code by Twareintor, Copyright (c) 2017 Claudiu Ciutacu mailto: <<ciutacu/d]gmail*com>>
// license: non-commercial use only

// To do: glittering with stars - use an array of maxPos

#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

/** Math constants: */ 
#define PI 3.14159265359

/** Program configuration constants */
#define SUNSIZE 45.0 // rec. 45.0

#define CLOUDSIZE 8. // rec. 9.0
#define CLOUDDENSITY 12. // rec.7.0
#define CLOUDSPEED 0.005 // rec. 0.005
#define TRIMCLOUDS 0.0 // rec.1.1

#define WINDSPEED 2.4
#define WAVEOFF 37.0 // rec 37.0
#define WATERCOLOR vec4(0.9, 0.9, 1.0, 1.0) 
#define WATERCONTRAST 2.1 // rec. 2.1
#define GLITTER 0.99 // rec. 1.0
#define REFLDISP 1.32 // rec. 1.27 = Sun reflected in Water

/** debug and dev constants: */
#define DEBUG_CLOUDS 0. // rec. 0.0

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
// uniform sampler2D renderbuffer;


float rand(vec2 uv)
{
    return fract( sin(dot(uv, vec2(12.432, 78.234))) * 4378.34 );
}


/** from here,  */
float r(vec2 n) {
    return fract(cos(dot(n,vec2(36.26,73.12)))*354.63);
}

float noise(vec2 uv) 
{
    vec2 i = floor( uv);
    vec2 f = fract( uv);
    f = smoothstep(0.0, 1.0,f);
    float x0 = mix(rand( i ), rand( i + vec2(1,0) ), f.x);
    float x1 = mix(rand( i + vec2(0,1) ), rand( i + vec2(1,1) ), f.x);
    float sum = mix(x0, x1, f.y);
    return sum;}


float perlin(vec2 n) 
{  
    return noise(n/32.)*0.5875+noise(n/16.)/5.+noise(n/8.)/10.+noise(n/4.)/20.+noise(n/2.)/40.+noise(n)/80.;
}

float perlin2(vec2 uv)
{
    return noise(uv*(resolution/2.))*0.015625+noise(uv*(resolution/4.))*0.03125+noise(uv*(resolution/8.))*0.0625+noise(uv*(resolution/16.))*0.125+noise(uv*(resolution/32.))*0.25+noise(uv*(resolution/64.))*0.5;
}

/** ~till here, block from: "http://www.glslsandbox.com/e#40767.0" */



/** my star for glittering effect  - actually not used - */
float star(vec2 pos0, float starsize)
{
    /** an improved version of the previous STAR with no expansion limit, full configurable */
    /** the full-width/height ray bug not removed but with it look more realistic if the star keeps moving */
    vec2 pos = gl_FragCoord.xy-pos0;
    float q =  0.98*(1.+pos.y*pos.x/(.0001+starsize*(+1.*float(pos.x<0. && pos.y>0. || pos.x>0. && pos.y<0.)-1.*(float(pos.x>0. && pos.y>0. || pos.x<0. && pos.y<0.)))));
    q*=abs(1.0-length(gl_FragCoord.xy-pos0)/min(resolution.y, resolution.x));
    return q;
}


float sun(vec2 pos, float size, float intensity)
{
    float q = clamp(1./length(gl_FragCoord.xy-pos)*size, 0., 1.);
    q*=clamp(intensity, 0., 1.);
	
    return q;
}

vec4 clouds2(vec2 hor, inout vec4 skyColor, in vec2 sunPos, float direction)
{
    /** note: trying not to use sunPos to elliminate redundancies... */
    float hv = abs(gl_FragCoord.y-hor.y);
    float deb_effect = mouse.y*resolution.y*DEBUG_CLOUDS; /** for debug only... */
    float l = (gl_FragCoord.x-hor.x)/(resolution.x-hor.x)/(abs(gl_FragCoord.y-hor.y)/(resolution.y-hor.y))/CLOUDSIZE+time*CLOUDSPEED;
    float h = (resolution.y/pow(hv, 1.0)+0.1*deb_effect)/CLOUDSIZE+time*CLOUDSPEED*0.5;
    float q = clamp(perlin2(vec2(l, h)), 0.2, 1.0);
    // q*=float(q>.05)*2.;
    q = pow(q, 7.5/CLOUDDENSITY);
    // q*=float(q>.5)*.4+1.;
    q = 1.-q;
    q = pow(q, 52./CLOUDSIZE*gl_FragCoord.y/resolution.y)*CLOUDDENSITY;
    q*=pow((gl_FragCoord.y-hor.y)/(resolution.y-hor.y), .3);
    q*=(sin((resolution.y+resolution.x*0.1)/(gl_FragCoord.y-hor.y)+time*CLOUDSPEED*.5))+1.-TRIMCLOUDS;	/** trim the clouds display */
    q*=float(abs(gl_FragCoord.y-hor.y)>16.);	/** ... pixels above ...prevents the clouds to reach the horizon... */
    float mixFactor = abs(sunPos.y-hor.y+SUNSIZE)/resolution.y;
    vec4 outColor = vec4(mix(q, skyColor.r, mixFactor*.4), mix(q, skyColor.g, (1.-mixFactor)*.9), mix(q, skyColor.b, (1.-mixFactor/2.)*.8), 1.);
    if(gl_FragCoord.y>hor.y) skyColor*=vec4(1.-q, 1.-q/2., 1.-q, 1.);
    /** endark the clouds when in front of the Sun: */ 
    outColor*=float(length(gl_FragCoord.xy-sunPos)-SUNSIZE)/250.;
    return outColor;
}

/************************** fog doesn't works as expected!!! 
float fog(vec2 pos)
{
    float q = (abs(gl_FragCoord.y-pos.y))/resolution.y/2.;
    q = pow(q, 3.); 
    return q;
}

**************/


vec4 sky(vec2 pos, inout vec2 sunPos, float direction, inout vec2 posMax[20])
{
    /** two versions: one for the above part and one for the reflected */
    vec4 outColor = vec4(0., 0., 0., 1.);
    vec4 skyColor; 
    float q;
    float y = sunPos.y;	
    if(direction<0.) sunPos.y-=2.*(sunPos.y-pos.y); /** reflect the position of the sun */
    /** the Sun a combination of red and green */
    skyColor.r = sun(sunPos, SUNSIZE/2.*(1.+(1.-direction*(+sunPos.y-pos.y)/(resolution.y))), 0.+abs(+y+pos.y)/(resolution.y-pos.y));
    skyColor.g = sun(sunPos, SUNSIZE/2.*(1.+(1.-direction*(+sunPos.y-pos.y)/(resolution.y))), 0.+abs(+y-pos.y)/(resolution.y-pos.y));
    skyColor.r=pow(skyColor.r, 3.+direction); /** DEBUG: it works... */
    // skyColor.g=pow(skyColor.g, 3.+direction);	
    /** the sky just blue: */
    skyColor.b = clamp(.5*abs(sunPos.y-pos.y+SUNSIZE)*(1./(resolution.y-pos.y)), 0.45, .99);
    /** then gradient sky: */
    skyColor.b*=(1.-1./(gl_FragCoord.xy-pos).y/(resolution.y-pos.y));
    if(direction>0.) /** a correction of the red color when near pos: */
    {
        skyColor.r=pow(skyColor.r, 7.); /** more contour red for the Sun at horizon line... */
	skyColor.b*=(1.-skyColor.r);      /** and less blue */  
    }
    /** the horizon will be more red when the sun reaches it */
    float rteint; 
    /**************** this version: *************/
    rteint = 1.-abs(sunPos.y-pos.y+SUNSIZE)/(resolution.y-pos.y);
    rteint*=1.-abs(gl_FragCoord.y-pos.y+SUNSIZE*direction)/(resolution.y-pos.y);
    /************** or this one:
    rteint = 1.-abs(gl_FragCoord.y-pos.y+SUNSIZE)/(resolution.y-pos.y);	
    rteint*= (1.-direction*(+sunPos.y-pos.y)/(resolution.y));
    rteint = pow(rteint, 1.);
    ****************/
    skyColor.r = mix(skyColor.r, rteint, .61); ////// HERE IS TO MODIFY SOMETING!!!!!!!!!
    // if(direction<0. && gl_FragCoord.y<pos.y){skyColor.r=1.;}
    skyColor.g = mix(skyColor.g, rteint, .15);
    skyColor.b-=rteint*.5;
    /** ensures that only what above the horizon line (pos.y) will be displayed */
    q = clamp(direction*(gl_FragCoord.y-pos.y), 0., 1.); // displays what is above 
    /** blur effect  */
    float blurvSun = 1.0;
    if(direction<0.0)
    {
        blurvSun = 0.025*float(SUNSIZE-abs(gl_FragCoord.x-sunPos.x)/REFLDISP);
    }
    /** clouds on the sky: *//** clouds must appear darker when in front of Sun... */
    vec4 cloudColor = clouds2(pos, skyColor, sunPos, direction);
    outColor = mix(outColor,cloudColor, .7);	
    // outColor.r*=cloudColor.r;	
    /** for the sky; for the sea, because the Sun is composed by r and g only:  */
    outColor = max(outColor, vec4(skyColor.r*q*blurvSun, skyColor.g*q*blurvSun, (skyColor.b-skyColor.r*skyColor.g)*q, 1.0));
    return outColor; 
}

vec4 sea(vec2 pos, vec4 skyColor, inout vec2 posMax[20])
{
    vec4 outColor = vec4(0.0, 0.0, 0.0, 1.0);
    float viewpoint = pow(tan(gl_FragCoord.y*PI/4./abs(pos.y-resolution.y+.1*abs(gl_FragCoord.y-pos.y)+gl_FragCoord.x/resolution.x*.5+WAVEOFF)), 2.);
    viewpoint = pow(viewpoint, 2.1);
    float q = (2.-sin(gl_FragCoord.y*viewpoint+(time+1200.)*WINDSPEED))*.5; /** for startup: time not zero */
    q*=clamp(perlin(viewpoint*vec2((time+100.)*64.+(gl_FragCoord.x-pos.x)*8.*1., +time*viewpoint*abs(gl_FragCoord.y-pos.y)/resolution.y+100.)), 0., 1.);
    q=pow(q, WATERCONTRAST); /** contrast */
    /** output color must contain the reflection of the sun in the water!!! */
    /** remember: water color is combined with sky color */
    outColor = min(vec4(q, q, q, 1.0), WATERCOLOR); /** make it simpler... */
    outColor*=4.;
    outColor = clamp(outColor*skyColor, 0.01, 1.);
    /** difraction to add here: */
    if(mix(outColor.r, outColor.g, .5)>.8 && q>.5) posMax[0] = gl_FragCoord.xy;
    outColor*=float(pos.y>gl_FragCoord.y); // only what is "under" the horizont line (y of the position) is displayed
    return outColor;

}

void main() 
{
    vec2 cen = resolution/2.;
    vec4 outColor = vec4(0., 0., 0., 1.);
    vec2 sunPos = vec2(mouse.x*resolution.x+180., mouse.y*resolution.y+SUNSIZE);
    vec2 posMax[20];
    outColor = sky(cen, sunPos, 1., posMax)*0.75;
    vec4 aSkyRefl = sky(cen, sunPos, -1., posMax);
    outColor = max(outColor, sea(cen, aSkyRefl, posMax));
    float glitt;
    glitt = mix(outColor.r, outColor.g, 0.5)*float(gl_FragCoord.xy==posMax[0])*GLITTER;
    outColor = max(outColor, vec4(max(glitt,outColor.r), max(glitt,outColor.g), 0., 1.));
    // outColor = mix(outColor, vec4(fog(cen)), .2); /** fog doesn't works as expected!!! */
    gl_FragColor = outColor; 

}			



/** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** */