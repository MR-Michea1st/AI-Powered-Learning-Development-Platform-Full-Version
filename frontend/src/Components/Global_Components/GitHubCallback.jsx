import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import './GitHubCallback.css'

function GitHubCallback() {

    const navigate = useNavigate()

    useEffect(() => {

        const code = new URLSearchParams(window.location.search).get("code")

        if (!code) {
            return
        }

        const loginWithGithub = async () => {

            try {

                const response = await axios.post(
                    "http://localhost:8000/auth/github/",
                    {
                        code: code
                    }
                )

                console.log(response.data)

                localStorage.setItem(
                    "access",
                    response.data.access
                )

                localStorage.setItem(
                    "refresh",
                    response.data.refresh
                )
                console.log("logged in with github successfully");
               setTimeout(()=> { 
                navigate("/");
                navigate(0);
               } , 1000);

            } catch (error) {

                console.log(error)

            }
        }

        loginWithGithub()

    }, [])

    return <div className="callback-github-cont">
        <p className="logging-in-github">Logging in with GitHub...</p>
        <span className="loader"></span>    
    </div>
}

export default GitHubCallback