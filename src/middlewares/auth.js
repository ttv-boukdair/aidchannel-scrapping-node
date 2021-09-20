const  expressJWT=require('express-jwt')
require("dotenv-flow").config();

exports.requireSignIn = expressJWT({
    secret:process.env.JWT_SECRET,
    algorithms:["HS256"],
    userProperty:'auth'
})
exports.isAuth=(req,res,next)=>
{ let user=req.profile && req.auth && (req.profile._id==req.auth._id)
  if (!user){
      return res.status(403).json({error:'access denied'})
  }

  next();

}
exports.isSuperAdmin=(req,res,next)=>
{ if(req.auth.role==2 || req.auth.role==1)
    { return res.status(403).json({
        error:'access denied !!!'
    })

    }
 next()

}
exports.isWebMaster = (req, res, next) => {
  if (req.auth.role == 0 || req.auth.role == 2) {
    return res.status(403).json({
      error: "access denied !!!",
    });
  }
  next();
};