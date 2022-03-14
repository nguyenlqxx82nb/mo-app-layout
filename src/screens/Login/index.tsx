import React from 'react';
import LoginContainer from './container';

export class LoginScreen extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        const { routes, mainTabIndex } = this.props;
        return (
            <LoginContainer
                routes={routes} mainTabIndex={mainTabIndex}  
            />
        );
    }
}
