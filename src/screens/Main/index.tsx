import React from 'react';
import Container from './container';

export class MainScreen extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);
    }

    componentDidMount() {}

    render() {
        return (
            <Container
                {...this.props}
            />
        );
    }
}
