exports.getLogin = (req, res, next) => {
    // const isAuthenticated = req.get('Cookie').trim().split('=')[1] === 'true';
    // console.log(req.get('Cookie').trim().split('=')[1], " DDDDDDDDDDDD", isAuthenticated)
    console.log(req.session," FFFFFFFFFF")
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        editing: false,
        isAuthenticated: req.session.isLogedIn
    });
};

exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie','loggedIn=true; ');
    req.session.userId = '62c7244240cc944e33ef289e';
    req.session.isLogedIn = true;
    res.redirect('/');
};