import { useState } from "react";
import api from "../../services/api";
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { useNavigate } from "react-router-dom";


const signupValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});


export default function SignupForm() {

    const [show , setShow] = useState({
        pass:false,
        confPass:false,
    });

    const [modalError, setModalError] = useState({
        show: false,
        message: '',
        type: 'error', // 'error' or 'success'
    });
  
    const navigate = useNavigate();

    async function handleSubmit(values) {
        try {
            const response = await api.post(`/auth/register/`, {
                full_name: values.fullName,
                email: values.email,
                password: values.password,
                password2: values.confirmPassword,
            } , {
                 headers: {
                    'Content-Type': 'multipart/form-data'
            }});

            console.log("Signup successful:", response.data);
            setModalError({
                show: true,
                message: "Account Created Successfully!",
                type: 'success'
            });

            navigate('/OTP-Verification' , {state:{email:response.data.email}})
    
        }
        catch(err) {
            console.error("Signup error:", err);

            if (err.response?.data?.email) {
                setModalError({
                    show: true,
                    message: "User with this email already exists",
                    type: 'error'
                });
            } else {
                setModalError({
                    show: true,
                    message: err.response?.data?.message || err.message,
                    type: 'error'
                });
            }
        }
    }


    const formik = useFormik({
        initialValues: {
            fullName:'',
            email:'',
            password:'',
            confirmPassword:'',
        },
        validationSchema:signupValidationSchema,
        onSubmit:handleSubmit,
    })

    return (
       <> 
        <form className="signup-form" onSubmit={formik.handleSubmit}>
            <input
                className="sign-input-group"
                label="Name"
                name="name"
                type="text"
                placeholder="Full Name"
                required
                {...formik.getFieldProps('fullName')}
            />
            {formik.touched.fullName && formik.errors.fullName && (
            <p className="error">{formik.errors.fullName}</p>
            )}
            <br></br>
            
            <input
                className="sign-input-group"
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                required
                {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
            <p className="error">{formik.errors.email}</p>
            )}
            <br></br>

            <input
                className="sign-input-group"
                label="Password"
                name="password"
                type={show.pass? `text` : `password`}
                placeholder="Password"
                required
                {...formik.getFieldProps('password')}
            />
            <button className="showPass-eye" onClick={(e)=> {e.preventDefault(); setShow({...show , pass:!show.pass})}}>{!show.pass ? '👁️' : '🙈'}</button>
            {formik.touched.password && formik.errors.password && (
            <p className="error">{formik.errors.password}</p>
            )}
            <br></br>

            <input
                className="sign-input-group"
                label="Password"
                name="confirmPassword"
                type={show.confPass? `text` : `password`}
                placeholder="Confirm Your Password"
                required
                {...formik.getFieldProps('confirmPassword')}
            />
            <button className="showPass-eye" onClick={(e)=> {e.preventDefault(); setShow({...show, confPass:!show.confPass})}}>{!show.confPass ? '👁️' : '🙈'}</button>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="error">{formik.errors.confirmPassword}</p>
            )}
            <br></br>

            <button className="signup-btn" type="submit" disabled={formik.isSubmitting}>Sign Up</button>
        </form>

        {modalError.show && (
            <div className="modal-overlay">
                <div className={`modal-content ${modalError.type}`}>
                    <h2>{modalError.type === 'success' ? '✓ Success' : '✗ Error'}</h2>
                    <p>{modalError.message}</p>
                    <button
                        className="modal-btn"
                        onClick={() => setModalError({ show: false, message: '', type: 'error' })}
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
        </> 
    );
}
