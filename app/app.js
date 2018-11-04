import React from 'react';
import { View } from 'react-native';
import {
  AppLoading,
  Font,
} from 'expo';
import {
  createDrawerNavigator,
  createStackNavigator,
} from 'react-navigation';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import {
  DefaultSignIn,
  DefaultSignUp,
  DefaultConfirmSignUp,
  DefaultForgotPassword,
  DefaultRequireNewPassword,
} from './screens/auth';
import { withRkTheme } from 'react-native-ui-kitten';
import { AppRoutes } from './config/navigation/routesBuilder';
import * as Screens from './screens';
import { bootstrap } from './config/bootstrap';
import track from './config/analytics';
import { data } from './data';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

bootstrap();
data.populateData();

const KittenApp = createStackNavigator({
  First: {
    screen: Screens.SplashScreen,
  },
  Home: {
    screen: createDrawerNavigator(
      {
        ...AppRoutes,
      },
      {
        contentComponent: (props) => {
          const SideMenu = withRkTheme(Screens.SideMenu);
          return <SideMenu {...props} />;
        },
      },
    ),
  },
}, {
  headerMode: 'none',
});

class App extends React.Component {
  onNavigationStateChange = (previous, current) => {
    const screen = {
      current: this.getCurrentRouteName(current),
      previous: this.getCurrentRouteName(previous),
    };
    if (screen.previous !== screen.current) {
      track(screen.current);
    }
  };

  getCurrentRouteName = (navigation) => {
    const route = navigation.routes[navigation.index];
    return route.routes ? this.getCurrentRouteName(route) : route.routeName;
  };

  renderApp = () => (
    <View style={{ flex: 1 }}>
      <KittenApp
        screenProps={{ ...this.props }}
        onNavigationStateChange={this.onNavigationStateChange}
      />
    </View>
  );

  render = () => (this.renderApp());
}

export default withAuthenticator(
  App,
  false,
  [
    <DefaultSignIn />,
    <DefaultSignUp />,
    <DefaultConfirmSignUp />,
    <DefaultForgotPassword />,
    <DefaultRequireNewPassword />,
  ],
);

