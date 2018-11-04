import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkTheme,
  RkButton,
  RkAvoidKeyboard,
} from 'react-native-ui-kitten';
import { Auth } from 'aws-amplify';
import { ForgotPassword  } from 'aws-amplify-react-native';
import { GradientButton } from '../../components/';
import { scaleVertical } from '../../utils/scale';

export class DefaultForgotPassword extends ForgotPassword  {
  constructor(props) {
    super(props);

    this.state = {
      delivery: null,
    };

    this.send = this.send.bind(this);
    this.submit = this.submit.bind(this);
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

  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/logo.png') : require('../../assets/images/logoDark.png')
  );

  renderImage = () => (
    <Image style={styles.image} source={this.getThemeImageSource(RkTheme.current)} />
  );

  send() {
    const { username } = this.state;
    if (!username) {
      this.error('Username cannot be empty');
      return;
    }
    Auth.forgotPassword(username)
      .then(data => {
        this.setState({ delivery: data.CodeDeliveryDetails });
      })
      .catch(err => this.error(err));
  }

  submit() {
    const {
      username,
      code,
      password,
      repeatPassword,
    } = this.state;
    if (password !== repeatPassword) {
      this.error('Passwords don\'t match');
      return;
    }
    Auth.forgotPasswordSubmit(username, code, password)
      .then(data => {
        Alert.alert('Password changed');
        this.changeState('signIn');
      })
      .catch(err => this.error(err));
  }

  forgotBody() {
    return (
      <View style={styles.content}>
        <RkTextInput
          rkType='rounded'
          placeholder='Email'
          autoCapitalize='none'
          onChangeText={(text) => this.setState({ username: text.trim() })}
        />
        <RkText rkType='secondary5 secondaryColor center'>
            Enter your email below to receive your password reset instructions
        </RkText>
        <GradientButton
          style={styles.save}
          rkType='large'
          text='SEND'
          onPress={this.send}
          disabled={!this.state.username}
        />
      </View>
    );
  }

  submitBody() {
    return (
      <View style={styles.content}>
        <RkTextInput
          rkType='rounded'
          onChangeText={(text) => this.setState({ code: text })}
          placeholder='Enter your confirmation code'
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
          placeholder='Password'
          autoCapitalize='none'
          secureTextEntry
          onChangeText={(text) => this.setState({ repeatPassword: text })}
        />
        <RkText rkType='secondary5 secondaryColor center'>
            Enter your email below to receive your password reset instructions
        </RkText>
        <GradientButton
          style={styles.save}
          rkType='large'
          text='Submit'
          onPress={this.submit}
          disabled={!this.state.username}
        />
      </View>
    );
  }


  showComponent() {
    return (
      <RkAvoidKeyboard
        behavior='position'
        style={styles.screen}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}>
        <View style={styles.header}>
          {this.renderImage()}
          <RkText rkType='h1'>Password Recovery</RkText>
        </View>
        { !this.state.delivery && this.forgotBody() }
        { this.state.delivery && this.submitBody() }
        <View style={styles.footer}>
          <View style={styles.textRow}>
            <RkText rkType='primary3'>Already have an account?</RkText>
            <RkButton rkType='clear' onPress={() => this.changeState('signIn')}>
              <RkText rkType='header6'>Sign in now</RkText>
            </RkButton>
          </View>
        </View>
      </RkAvoidKeyboard>
    );
  }
}

const styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingVertical: scaleVertical(24),
    justifyContent: 'space-between',
    backgroundColor: theme.colors.screen.base,
  },
  header: {
    alignItems: 'center',
  },
  image: {
    marginVertical: scaleVertical(27),
    height: scaleVertical(77),
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  save: {
    marginVertical: 20,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footer: { },
}));
