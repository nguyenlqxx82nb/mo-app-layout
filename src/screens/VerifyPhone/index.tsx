import React from 'react';
import Container from '../SignUp/container';
import { Languages } from '@common';

export class VerifyPhoneScreen extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const { accessToken, social } = this.props;
        return (
            <Container
                type={'social'}
                title={Languages.VerifyPhone}
                accessToken={accessToken}
                social={social}
            />
        );
    }
}
