export const ModalStyles = {
    container: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        zIndex: '1001',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        textAlign: 'center',
        color: 'white',
        width: '300px',
        boxShadow: '0 0 20px rgba(93, 93, 170, 0.5)',
        border: '2px solid #4a4a8f',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        transition: 'all 0.3s ease',
        opacity: '0'
    },
    
    title: {
        margin: '0 0 10px 0'
    },
    
    input: {
        width: '90%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        border: '1px solid #4a4a8f'
    },
    
    errorMessage: {
        color: '#ff6b6b',
        fontSize: '14px',
        height: '20px',
        visibility: 'hidden'
    },
    
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: '10px'
    },
    
    button: {
        base: {
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 16px',
            cursor: 'pointer'
        },
        create: {
            backgroundColor: '#4a4a8f'
        },
        cancel: {
            backgroundColor: '#8f4a4a'
        }
    }
};