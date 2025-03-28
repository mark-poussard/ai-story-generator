import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text }) => {
    return (
        <div className={`${styles.spinnerContainer} ${styles[size]}`}>
            <div className={styles.spinner}></div>
            {text && <span className={styles.spinnerText}>{text}</span>}
        </div>
    );
};

export default LoadingSpinner;