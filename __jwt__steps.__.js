/**
 * install jsonwebtoken
 * jwt.sign(payload, secret, {expiresIn:})
 * token client 
 * */ 


/**
 * how to store in the client side
 * 1. memory => ok type
 * 2. local storage => ok type (xss) 
 * 3. cookies: http only
 * */ 

/**
 * 1. set the  cookies with http only. for development source: false, 
 * 2. cors
 * app.use(
  cors({
    origin: ["http://localhost:5173/"],
    credentials: true,
  })
);
 * 
 * 3. client side axios setting
 * 
 */


// client site e secret key create er jonno first e terminal open kore (node) lekhe enter kore ei require('crypto').randomBytes(64).toString('hex') enter korte hobe taholei access token ba secret key pawa jabe 
// example --> 428f823dff2ebbc82d4ef0fce842654d5eeac275c03a07a90621936eeb38c99ac329be795463c31dad7c286fafe3e14dc1a59116040c2912098d58ac7a32aaeb


/**
 * 1. to send cookies from the client make sure you added withCredential true for the api call using axios;
 * 2. use cookieParser in middleware
 *  
 */ 