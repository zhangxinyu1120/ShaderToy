#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//  Function from Iñigo Quiles
//  www.iquilezles.org/www/articles/functions/functions.htm
float impulse( float k, float x ){
    float h = k*x;
    return h*exp(1.0-h);
}


float cubicPulse( float c, float w, float x )
{
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

    
float expStep( float x, float k, float n )
{
    return exp( -k*pow(x,n) );
}


float sinc( float x, float k )
{
    float a = PI * (float(k)*x-1.0);
    return sin(a)/a;
}

float smoothstepCustom(float a, float b, float x)
{
    if (x<a) return 0.0;
    if (x>b) return 1.0;

    float y=(x-a)/(b-a);

    return 3.0*y*y-2.0*y*y*y;
}

float stepCustom(float edge, float x)
{
    if (x < edge) return 0.0;

    return 1.0;
}

float plot(vec2 st, float pct){
  return  smoothstepCustom( pct-0.02, pct, st.y) -
          smoothstepCustom( pct, pct+0.02, st.y);
}

/***********************多项式造型函数***************************/

//像cos（）和sin（）这样的三角函数在自然科学，工程和动画中无处不在，但它们的计算可能很昂贵。
//如果情况每秒需要数百万次三角运算，则通过使用由简单算术函数构成的近似值可以获得实质的速度优化。
// 一个例子是Blinn-Wyvill多项式逼近升起的倒置余弦，它在[0 ... 1]范围内偏离真实（缩放）三角函数小于0.1％。
// 它也分享一些升高的倒置余弦的关键属性，在0和1处具有平坦的导数，在x = 0.5时具有0.5的值。它具有强大的优势，
// 即计算相对高效，因为它仅由简单的算术运算和可缓存的分数组成。不像升起的倒置余弦，它没有无限导数，
// 但由于它是六阶函数，所以在实践中这个限制不太可能被注意到。
//http://www.flong.com/storage/images/texts/shapers/equations/eqn_bourke_blinn_wyvill_i.png
float blinnWyvillCosineApproximation (float x){
  float x2 = x*x;
  float x4 = x2*x2;
  float x6 = x4*x2;
  
  float fa = ( 4.0/9.0);
  float fb = (17.0/9.0);
  float fc = (22.0/9.0);
  
  float y = fa*x6 - fb*x4 + fc*x2;
  return y;
}



// http://www.flong.com/texts/code/shapers_poly/

//------------------------------------------------
// 这个座位形函数是通过连接两个三阶多项式（立方体）曲线形成的。 
// 曲线在单位正方形的控制坐标（a，b）处遇到水平拐点。
float doubleCubicSeat (float x, float a, float b){
  
  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  float min_param_b = 0.0;
  float max_param_b = 1.0;
  a = min(max_param_a, max(min_param_a, a));  
  b = min(max_param_b, max(min_param_b, b)); 
  
  float y = 0.0;
  if (x <= a)
  {
    y = b - b*pow(1.-x/a, 3.0);
  } 
  else 
  {
    y = b + (1.-b)*pow((x-a)/(1.-a), 3.0);
  }

  return y;
}

//指数造型函数
//-----------------------------------------
float exponentialEasing (float x, float a){
  
  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  a = max(min_param_a, min(max_param_a, a));
  
  if (a < 0.5){
    // emphasis
    a = 2.0*(a);
    float y = pow(x, a);
    return y;
  } else {
    // de-emphasis
    a = 2.0*(a-0.5);
    float y = pow(x, 1.0/(1.-a));
    return y;
  }
}

//---------------------------------------------
float doubleExponentialSeat (float x, float a){

  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  a = min(max_param_a, max(min_param_a, a)); 

  float y = 0.;
  if (x<=0.5){
    y = (pow(2.0*x, 1.-a))/2.0;
  } else {
    y = 1.0 - (pow(2.0*(1.0-x), 1.-a))/2.0;
  }
  return y;
}

//------------------------------------------------
float doubleExponentialSigmoid (float x, float a){

  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  a = min(max_param_a, max(min_param_a, a));
  a = 1.0-a; // for sensible results
  
  float y = 0.;
  if (x<=0.5){
    y = (pow(2.0*x, 1.0/a))/2.0;
  } else {
    y = 1.0 - (pow(2.0*(1.0-x), 1.0/a))/2.0;
  }
  return y;
}

//---------------------------------------
float logisticSigmoid (float x, float a){
  // n.b.: this Logistic Sigmoid has been normalized.

  float epsilon = 0.0001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  a = max(min_param_a, min(max_param_a, a));
  a = (1./(1.-a) - 1.);

  float A = 1.0 / (1.0 + exp(0. -((x-0.5)*a*2.0)));
  float B = 1.0 / (1.0 + exp(a));
  float C = 1.0 / (1.0 + exp(0.-a)); 
  float y = (A-B)/(C-B);
  return y;
}

//------------------------------
float circularEaseIn (float x){
  float y = 1. - sqrt(1. - x*x);
  return y;
}

//------------------------------
float circularEaseOut (float x){
  float y = sqrt(1. - sqrt(1. - x));
  return y;
}

//----------------------------------------
float doubleCircleSeat (float x, float a){
  float min_param_a = 0.0;
  float max_param_a = 1.0;
  a = max(min_param_a, min(max_param_a, a)); 

  float y = 0.;
  if (x<=a){
    y = sqrt(sqrt(a) - sqrt(x-a));
  } else {
    y = 1. - sqrt(sqrt(1.-a) - sqrt(x-a));
  }
  return y;
}
//-------------------------------------------
float doubleCircleSigmoid (float x, float a){
  float min_param_a = 0.0;
  float max_param_a = 1.0;
  a = max(min_param_a, min(max_param_a, a)); 

  float y = 0.;
  if (x<=a){
    y = a - sqrt(a*a - x*x);
  } else {
    y = a + sqrt(sqrt(1.-a) - sqrt(x-1.));
  }
  return y;
}
//---------------------------------------------------
float doubleEllipticSeat (float x, float a, float b){
  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  float min_param_b = 0.0;
  float max_param_b = 1.0;
  a = max(min_param_a, min(max_param_a, a)); 
  b = max(min_param_b, min(max_param_b, b)); 

  float y = 0.;
  if (x<=a){
    y = (b/a) * sqrt(sqrt(a) - sqrt(x-a));
  } else {
    y = 1.- ((1.-b)/(1.-a))*sqrt(sqrt(1.-a) - sqrt(x-a));
  }
  return y;
}
//------------------------------------------------------
float doubleEllipticSigmoid (float x, float a, float b){

  float epsilon = 0.00001;
  float min_param_a = 0.0 + epsilon;
  float max_param_a = 1.0 - epsilon;
  float min_param_b = 0.0;
  float max_param_b = 1.0;
  a = max(min_param_a, min(max_param_a, a)); 
  b = max(min_param_b, min(max_param_b, b));
 
  float y = 0.;
  if (x<=a){
    y = b * (1. - (sqrt(sqrt(a) - sqrt(x))/a));
  } else {
    y = b + ((1.-b)/(1.-a))*sqrt(sqrt(1.-a) - sqrt(x-1.));
  }
  return y;
}







/***************************end********************************/
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution;

    st-=vec2(0.5);
    // float y = impulse(12.,st.x);
    //float y = 5.0*st.x * st.x;
    //float y = cubicPulse(0.5, 0.2, st.x);

    //float y = expStep(st.x, 1.0, 2.0);
    // float y = 0.5 * sinc(st.x, 20.0);
    // st.y-=0.5;

    //float y = stepCustom(0.5, st.x);
    //float y = abs(0.2 * sin(4.0*PI * st.x ));
    //float y = fract(sin(4.0*PI * st.x ));
    // float y = floor(sin(40.0*PI * st.x ));
    //float y = mod(st.x,0.5); // 返回 x 对 0.5 取模的值
    //y = fract(x); // 仅仅返回数的小数部分
    //y = ceil(x);  // 向正无穷取整
    //y = floor(x); // 向负无穷取整
    //y = sign(x);  // 提取 x 的正负号
    //y = abs(x);   // 返回 x 的绝对值
    //y = clamp(x,0.0,1.0); // 把 x 的值限制在 0.0 到 1.0
    //y = min(0.0,x);   // 返回 x 和 0.0 中的较小值
    //y = max(0.0,x);   // 返回 x 和 0.0 中的较大值 
    // float y=blinnWyvillCosineApproximation(PI * st.x);

    // float y=doubleCubicSeat(st.x, 0.2, 0.5);
    // float y=exponentialEasing(st.x,.5);
    float y = circularEaseIn(st.x);
    vec3 color = vec3(y);

    float pct = plot(st,y);
    color = (1.0-pct)*color+pct*vec3(0.0,1.0,0.0);

    gl_FragColor = vec4(color,1.0);

    // vec2 st = gl_FragCoord.xy/u_resolution;

    // float y = st.x;

    // vec3 color = vec3(y);

    // // Plot a line
    // float pct = plot(st,y);
    // color = (1.0-pct)*color+pct*vec3(1.0,0.0,0.0);

    // gl_FragColor = vec4(color,1.0);
}