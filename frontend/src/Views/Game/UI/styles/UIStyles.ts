import { FontHelper } from '../../FontHelper.js';

export const UIStyles = {
    container: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        zIndex: '1000',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #4a4a8f',
        boxShadow: '0 0 20px rgba(93, 93, 170, 0.5)'
    },
    
    title: {
        color: 'white',
        marginBottom: '20px',
        fontFamily: FontHelper.MIGHTY_SOULY_FONT,
        fontSize: '24px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textAlign: 'center'
    },
    
    button: {
        base: {
            background: 'linear-gradient(to bottom, #4a4a8f, #2d2d64)',
            color: 'white',
            borderRadius: '6px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '160px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: '5px 0',
            border: '1px solid #5d5daa',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            fontFamily: FontHelper.MIGHTY_SOULY_FONT
        },
        hover: {
            background: 'linear-gradient(to bottom, #5d5daa, #4a4a8f)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)'
        },
        active: {
            transform: 'translateY(1px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
        },
        disabled: {
            opacity: '0.5',
            cursor: 'not-allowed'
        }
    },
    
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid #5d5daa'
    },
    
    select: {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid #5d5daa',
        fontSize: '16px',
        fontFamily: "'Arial', sans-serif",
        fontWeight: 'bold',
        cursor: 'pointer',
        marginBottom: '10px'
    },
    
    spinner: {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
        },
        element: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            animation: 'spin 1s linear infinite'
        },
        text: {
            color: 'white',
            fontFamily: FontHelper.MIGHTY_SOULY_FONT,
            fontSize: '18px'
        }
    }
};