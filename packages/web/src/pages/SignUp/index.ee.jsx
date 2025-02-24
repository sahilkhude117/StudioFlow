import * as React from 'react';
import Box from '@mui/material/Box';
import useCloud from 'hooks/useCloud';
import Container from 'components/Container';
import SignUpForm from 'components/SignUpForm/index.ee';
import { redirect } from 'react-router-dom';

export default function SignUp(){
    useCloud({ redirect: true});
    
    return (
        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <Container maxWidth='sm'>
                <SignUpForm/>
            </Container>
        </Box>
    )
}