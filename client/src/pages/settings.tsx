import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import * as React from 'react';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = ({}) => {
    return (
        <></>
    );
}

export default withUrqlClient(createUrqlClient)(Settings); // wrap the page into urql