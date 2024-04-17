import React, { useState, useContext } from 'react'
import { Link } from "react-router-dom";
import Logo from '../images/logo.png'
import {FaBars} from  "react-icons/fa"
import {AiOutlineClose} from "react-icons/ai"

import { UserContext } from '../context/userContext';

const Header = () => {
    const [isNavShowing,setIsNavShowing] =useState(window.innerWidth > 800 ? true : false)
    const {currentUser} = useContext(UserContext);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const closeNavHandler=() => {
        setSelectedCategory(null)
        if(window.innerWidth < 800){
            setIsNavShowing(false)
        }
        else{
            setIsNavShowing(true)
        }
    }

    const handleCategory = (category) => {
        setSelectedCategory(category);
      };


    return (
        <nav>
            <div className='container nav__container'>
                <Link to="/" className='nav__logo' onClick={closeNavHandler}>
                    <img src={Logo} alt="NavBar Logo" />
                </Link>
                {currentUser?.id && isNavShowing && <ul className='nav__menu'>
                    <li><Link to={`/profile/${currentUser.id}`} onClick={closeNavHandler}>{`${currentUser?.name}`} </Link></li>
                    <li><Link to="/create" onClick={closeNavHandler}>Create Post</Link></li>
                    <li><Link to="/authors" onClick={closeNavHandler}>Authors</Link></li>
                    <li><Link to="/logout" onClick={closeNavHandler}>Logout</Link></li>
                </ul>}
                {!currentUser?.id && isNavShowing && <ul className='nav__menu'>
                    <li><Link to="/authors" onClick={closeNavHandler}>Authors</Link></li>
                    <li><Link to="/login" onClick={closeNavHandler}>Login</Link></li>
                </ul>}
                <button className='="nav__toggle-btn visible' onClick={()=> setIsNavShowing(!isNavShowing)}>
                    {isNavShowing ? <AiOutlineClose/> : <FaBars/>}
                </button>
            </div>

            <ul className='footer__categories'>
                <li><Link  id={selectedCategory==="Agriculture"?"selected":""}
                onClick={()=>handleCategory("Agriculture")} to="/posts/categories/Agriculture">Agriculture</Link></li>
                <li ><Link id={selectedCategory==="Business"?"selected":""}
                onClick={()=>handleCategory("Business")} to="/posts/categories/Business">Business</Link></li>
                <li ><Link id={selectedCategory==="Education"?"selected":""}
                onClick={()=>handleCategory("Education")} to="/posts/categories/Education">Education</Link></li>
                <li><Link id={selectedCategory==="Entertainment"?"selected":""}
                onClick={()=>handleCategory("Entertainment")} to="/posts/categories/Entertainment">Entertainment</Link></li>
                <li ><Link id={selectedCategory==="Art"?"selected":""}
                onClick={()=>handleCategory("Art")} to="/posts/categories/Art">Art</Link></li>
                <li ><Link id={selectedCategory==="Investment"?"selected":""}
                onClick={()=>handleCategory("Investment")} to="/posts/categories/Investment">Investment</Link></li>
                <li ><Link id={selectedCategory==="Uncategorized"?"selected":""}
                onClick={()=>handleCategory("Uncategorized")} to="/posts/categories/Uncategorized">Uncategorized</Link></li>
                <li><Link  id={selectedCategory==="Weather"?"selected":""}
                onClick={()=>handleCategory("Weather")} to="/posts/categories/Weather">Weather</Link></li>
            </ul>
        </nav>
    )
}

export default Header