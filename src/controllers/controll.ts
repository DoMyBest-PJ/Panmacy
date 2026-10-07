export function homepage(req:any, res:any){
    res.render("index",{activePage:1});
}

export function forum(req:any, res:any){
    res.render("forum",{activePage:2});
}

export function login(req:any, res:any){
    res.render("login");
}

export function cart(req:any, res:any){
    res.render("cart");
}

export function profile(req:any,res:any){
    res.render("profile");
}

export function orders(req:any,res:any){
    res.render("orders");
}

export function admin(req:any , res:any){
    res.render("admin/admin");
}

export function pharmacist_signup(req:any , res:any){
    res.render("pharmacist-signup");
}

export function pharmacy_dashboard(req:any , res:any){
    res.render("pharmacy-dashboard")
}