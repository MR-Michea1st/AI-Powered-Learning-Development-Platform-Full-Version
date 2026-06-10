import React from 'react';

export default function Info({ name, email, avatar }) {
    return (
        <section className="profile-info">
            <div className="avatar-wrap">
                <img src={avatar || 'https://www.w3schools.com/howto/img_avatar.png'} alt={`${name} avatar`} className="avatar" />
            </div>
            <div className="info-text">
                <h1 className="profile-name">{name}</h1>
                <p className="profile-email">{email}</p>
            </div>
        </section>
    );
}

