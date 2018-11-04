import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
  RkTheme,
  RkAvoidKeyboard,
} from 'react-native-ui-kitten';
import {
  Auth,
} from 'aws-amplify';
import { SignUp } from 'aws-amplify-react-native';
import { GradientButton } from '../../components/';
import { scaleVertical } from '../../utils/scale';
import NavigationType from '../../config/navigation/propTypes';

export class DefaultSignUp extends SignUp {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      email: null,
    };

    this.signUp = this.signUp.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
  }

  signUp() {
    const { username, password, email } = this.state;
    Auth.signUp(username, password, email)
      .then(data => {
        this.changeState('confirmSignUp', username);
      })
      .catch(err => this.error(err));
  }

  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/logo.png') : require('../../assets/images/logoDark.png')
  );

  renderImage = () => (
    <Image style={styles.image} source={this.getThemeImageSource(RkTheme.current)} />
  );

  error(err) {
    let msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else if (err.message) {
      msg = err.message;
    } else {
      msg = JSON.stringify(err);
    }

    const map = this.props.errorMessage || this.props.messageMap;
    msg = (typeof map === 'string') ? map : map(msg);
    this.setState({ error: msg });
    Alert.alert(msg);
  }

  onSignUp() {
    if (this.state.password === this.state.repeatpassword) {
      this.state.email = this.state.username;
      this.signUp();
    } else {
      console.log("Passwords do not match");
      this.error({ message: "Passwords do not match" });
    }
  }

  showComponent() {
    return (
      <RkAvoidKeyboard
        style={styles.screen}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}>
        <View style={{ alignItems: 'center' }}>
          {this.renderImage()}
          <RkText rkType='h1'>Registration</RkText>
        </View>
        <View style={styles.content}>
          <View>
            <RkTextInput
              rkType='rounded'
              autoCapitalize='none'
              placeholder='Email'
              onChangeText={(text) => this.setState({ username: text })} 
            />
            <RkTextInput
              rkType='rounded'
              placeholder='Password'
              autoCapitalize='none'
              secureTextEntry
              onChangeText={(text) => this.setState({ password: text })}
            />
            <RkTextInput
              rkType='rounded'
              placeholder='Confirm Password'
              autoCapitalize='none'
              secureTextEntry
              onChangeText={(text) => this.setState({ repeatpassword: text })}
            />
            <GradientButton
              style={styles.save}
              rkType='large'
              text='SIGN UP'
              onPress={this.onSignUp}
            />
          </View>
          <View style={styles.footer}>
            <View style={styles.textRow}>
              <RkText rkType='primary3'>Already have an account?</RkText>
              <RkButton rkType='clear' onPress={() => this.changeState('signIn')}>
                <RkText rkType='header6'>Sign in now</RkText>
              </RkButton>
            </View>
          </View>
        </View>
      </RkAvoidKeyboard>
    );
  }
}

const styles = RkStyleSheet.create(theme => ({
  screen: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: theme.colors.screen.base,
  },
  image: {
    marginBottom: 10,
    height: scaleVertical(77),
    resizeMode: 'contain',
  },
  content: {
    justifyContent: 'space-between',
  },
  save: {
    marginVertical: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: 24,
    justifyContent: 'space-around',
  },
  footer: {
    justifyContent: 'flex-end',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));
