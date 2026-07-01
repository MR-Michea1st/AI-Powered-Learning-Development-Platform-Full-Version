import LoginForm from "./LoginForm";
import Button from "../Global_Components/Button";
import pic1 from "../../assets/imgs/Google.png"
import pic3 from "../../assets/imgs/Github.png"
import './Login.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {

  const navigate = useNavigate();

    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (credentialResponse) => {
            const googleToken = credentialResponse.access_token
            // console.log(credentialResponse);
            
            try {
                
                const response = await axios.post('http://localhost:8000/auth/google/' , 
                    {
                            access_token: googleToken,
                        
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                )

                localStorage.setItem('access' , response.data.access);
                localStorage.setItem('refresh' , response.data.refresh);
                console.log('login successfull');
                setTimeout(() => {
                  navigate('/')
                  navigate(0);
                 } , 1000);
                
            } catch (err) {
                console.error("Faild to sign up with google due to :: " , err);
                
            }
        },

        onError:(err) => {console.log('Login Failed :: '  , err)}
            
    })


    const handleGitHubLogin = async () => {
         const clientId =
            import.meta.env.VITE_GITHUB_CLIENT_ID

        const redirectUri =
            "http://localhost:3000/github/callback"

        const githubUrl =
            `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`

        window.location.href = githubUrl
    }



  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <LoginForm />
     <div className="or-cont"> 
        <hr className="login-hr"/>
          <p className="OR">OR</p>
        <hr className="login-hr"/>
     </div>
     <div className="continue-btns">
        <button className="continue-with" onClick={handleGoogleAuth}><img className="continue-with-img"src={pic1} alt='Google' /><p>Continue with Google</p></button>
        <br />
        {/* <button className="continue-with" onClick={handleGitHubLogin}><img className="continue-with-img"src={pic3} alt='Github' /><p>Continue with Github</p></button>
        <br /> */}
      </div>
    </div>

  );
}
