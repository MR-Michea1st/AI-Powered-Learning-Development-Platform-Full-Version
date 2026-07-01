import './Footer.css';
// import whatsAppIcon from '../assets/imgs/whatsAppIcon.png'
// import emailIcon from '../assets/imgs/emailIcon.png'
// import facebookIcon from '../assets/imgs/facebookLogo.png'
const Footer = () => {
  
    return (
        <>
          <div className="footer-container">
             <div className='about-cont'>   
              <h3 className='footer-h3'>About US:</h3>
              <p className='about-desc'>CodeVerse is a significant helper tool in a 
                <br/>life of every developer who wants to build and improve skills of development in any track.
                <br/>Also, it provides a real-world like simulation of interview using AI.
                <br/> &copy; All rights reserved</p>
             </div>   
               
               <hr className='footer-hr'></hr>

             <div className='contact-cont'>     
              <h3 className='footer-h3'>Contact Us :</h3>
              <ul className='footer-ulist'>
                <li>Facebook</li>
                <li>Email</li>
                <li>WhatsApp</li>
              </ul>
             </div>

            </div>
           
        </>
    );


}

export default Footer;