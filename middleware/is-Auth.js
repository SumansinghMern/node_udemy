module.exports = (req,res,next) => {
    if (!req.session.isLogedIn){
        res.redirect('/login');
    }
    next();
}