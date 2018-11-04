import React from 'react';
import {
  View,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkTheme,
  RkStyleSheet,
} from 'react-native-ui-kitten';
import {
  Auth,
} from 'aws-amplify';
import { SignIn } from 'aws-amplify-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { FontAwesome } from '../../assets/icons';
import { GradientButton } from '../../components/gradientButton';
import { scaleVertical } from '../../utils/scale';
// import NavigationType from '../../config/navigation/propTypes';

export class DefaultSignIn extends SignIn {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      password: null,
      error: null,
      spinner: false,
    };

    this.facebookSignIn = this.facebookSignIn.bind(this);
  }


  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/logo.png') : require('../../assets/images/logoDark.png')
  );

  renderImage = () => (
    <Image style={styles.image} source={this.getThemeImageSource(RkTheme.current)} />
  );

  signIn() {
    const { username, password } = this.state;
    // logger.debug('Sign In for ' + username);
    this.setState({ spinner: true });
    Auth.signIn(username, password)
      .then(user => {
        // logger.debug(user);
        // const requireMFA = (user.Session !== null);
        this.setState({ spinner: false });
        if (user.challengeName === 'SMS_MFA') {
          this.changeState('confirmSignIn', user);
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          // logger.debug('require new password', user.challengeParam);
          this.changeState('requireNewPassword', user);
        } else {
          console.log('got aws credentials!!!! ' + JSON.stringify(user,2,2));
          this.checkContact(user);
        }
      })
      .catch(err => {
        this.setState({ spinner: false });
        console.log("error " + JSON.stringify(err))
        if (err.code === 'UserNotConfirmedException') {
          this.changeState('confirmSignUp', username);
        } else {
          this.error(err);
        }
      });
  }

  async facebookSignIn() {
    const { type, token, expires } = await Expo.Facebook.logInWithReadPermissionsAsync(
      '1112955052195883',
      {
        behaviour: 'system',
        permissions: ['public_profile', 'email']
      }
    );
    if (type === 'success') {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      const user = await response.json();

      Auth.federatedSignIn('facebook', { token, expires_at: expires }, user)
        .then(credentials => {
          return Auth.currentAuthenticatedUser();
        }).then(authUser => {
          this.changeState('signedIn', authUser);
        }).catch(e => {
          console.log('error ' + e);
        });
    } else {
      // Handle errors here.
      Alert.alert('Facebook login not possible.');
    }
  }

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

  showComponent() {
    return (
      <RkAvoidKeyboard
        style={styles.screen}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}>
        <Spinner
          visible={this.state.spinner}
          textContent='Signing in ...'
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.header}>
          {this.renderImage()}
          <RkText rkType='light h1'>React Native2</RkText>
          <RkText rkType='logo h0'>UI Kitten</RkText>
        </View>
        <View style={styles.content}>
          <View>
            <RkTextInput
              rkType='rounded'
              placeholder='Username'
              autoCapitalize='none'
              onChangeText={(text) => this.setState({ username: text.trim() })}
            />
            <RkTextInput
              rkType='rounded'
              placeholder='Password'
              autoCapitalize='none'
              secureTextEntry
              onChangeText={(text) => this.setState({ password: text })}
            />
            <GradientButton
              style={styles.save}
              rkType='large'
              text='LOGIN'
              onPress={this.signIn}
            />
          </View>
          <View style={styles.buttons}>
            <RkButton style={styles.button} rkType='social'>
              <RkText rkType='awesome hero'>{FontAwesome.twitter}</RkText>
            </RkButton>
            <RkButton style={styles.button} rkType='social'>
              <RkText rkType='awesome hero'>{FontAwesome.google}</RkText>
            </RkButton>
            <RkButton style={styles.button} rkType='social' onPress={this.facebookSignIn}>
              <RkText rkType='awesome hero'>{FontAwesome.facebook}</RkText>
            </RkButton>
          </View>
          <View style={styles.footer}>
            <View style={styles.textRow}>
              <RkText rkType='primary3'>Don’t have an account?</RkText>
              <RkButton rkType='clear' onPress={() => this.changeState('signUp')}>
                <RkText rkType='header6'>Sign up now</RkText>
              </RkButton>
            </View>
          </View>
          <View style={styles.footer2}>
            <View style={styles.textRow}>
              <RkButton rkType='clear' onPress={() => this.changeState('forgotPassword')}>
                <RkText rkType='header6'>Password recovery</RkText>
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
    padding: scaleVertical(16),
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.screen.base,
  },
  image: {
    height: scaleVertical(77),
    resizeMode: 'contain',
  },
  header: {
    paddingBottom: scaleVertical(10),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  content: {
    justifyContent: 'space-between',
  },
  save: {
    marginVertical: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: scaleVertical(24),
    marginHorizontal: 24,
    justifyContent: 'space-around',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    borderColor: theme.colors.border.solid,
  },
  footer: {
  },
  footer2: {
    alignItems: 'center',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
}));
