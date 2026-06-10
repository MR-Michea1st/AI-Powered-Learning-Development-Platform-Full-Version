function Button(props) {
    return (
        <button className="continue-with"><img className="continue-with-img"src={props.photo} alt={props.with} /><p>Continue with {props.with}</p></button>
    );
}

export default Button;