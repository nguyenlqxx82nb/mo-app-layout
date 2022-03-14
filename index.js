
import {AppRegistry} from 'react-native';
import App from './App';
// import Test1 from './src/index';
import {name as appName} from './app.json';
import { LogBox } from 'react-native';

// Ignore log notification by message:
LogBox.ignoreLogs(['Warning: ...']);

// Ignore all log notifications:
LogBox.ignoreAllLogs();

AppRegistry.registerComponent(appName, () => App);