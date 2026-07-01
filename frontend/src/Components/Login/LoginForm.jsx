import { useState } from "react";
//import { useContext , createContext, useEffect} from 'react'
import { login } from "../../services/authService";
import './Login.css'
import {useAuth} from '../../Context/AuthContext.jsx'
import {Formik , useFormik} from 'formik'
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";

const LoginValidationSchema = Yup.object({
  email: Yup.string()
  .email('Invalid Email Address')
  .required('Email is Required'),

  password: Yup.string()
               .min(6 , 'Password must be at least 6 characters')
               .required('Password is Required'),
});

export default function LoginForm() {
  const [showPass , setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const {setToken} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoginError("");
    try {
      const result = await login(values.email, values.password);
      localStorage.setItem('access' , result.data.access);
      localStorage.setItem('refresh' , result.data.refresh);
      setToken(result.data.access)
      navigate('/')
    } catch (error) {
      setLoginError("Log in failed because either your email or password is wrong");
      console.error("Login error:", error);
    }
  };

  const formik = useFormik({

    initialValues: {
      email:'',
      password:'',
    },
    validationSchema:LoginValidationSchema,
    onSubmit:handleSubmit,

  })


  return (
    <>
      {loginError && (
        <div className="error-modal-overlay" onClick={() => setLoginError("")}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h2>Login Failed</h2>
            </div>
            <div className="error-modal-body">
              <p>{loginError}</p>
            </div>
            <div className="error-modal-footer">
              <button
                className="error-modal-btn"
                onClick={() => setLoginError("")}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="login-form">
        <input
          className="input-group"
          label="Email"
          type="email"
          placeholder="Email"
          {...formik.getFieldProps('email')}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="error">{formik.errors.email}</p>
        )}
        <br />

        <input
          className="input-group"
          label="Password"
          type={showPass? `text`:`password`}
          placeholder="Password"
          {...formik.getFieldProps('password')}
        />
        <button className="showPass-eye" onClick={(e)=> {e.preventDefault(); setShowPass(!showPass)}}>{!showPass ? '👁️' : '🙈'}</button>

        {formik.touched.password && formik.errors.password && (
          <p className="error">{formik.errors.password}</p>
        )}
        <br />

        <button className="login-btn" type="submit" disabled={formik.isSubmitting}>Login</button>
      </form>
    </>
  );
}

