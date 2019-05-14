import React from 'react';
import "./SetInput.css";

export class SetInput extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        if (!this.props.display) {
            return null;
        }
        return (
            <div>
                La la la la la
            </div>
        )
    }
}