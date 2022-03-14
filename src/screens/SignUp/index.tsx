import React from 'react';
import Container from './container';

export class SignUpScreen extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        const { navigation } = this.props;
        return (
            <Container
                navigation={navigation}
            />
        );
    }
}

export default SignUpScreen;
