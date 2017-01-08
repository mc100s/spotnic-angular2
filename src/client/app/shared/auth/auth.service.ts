import { Injectable }      from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';

// Avoid name not found warnings
declare var Auth0Lock: any;

@Injectable()
export class AuthService {
  // Configure Auth0
  lock = new Auth0Lock(
    'N0vH3sDIxHOwHcQfF5OC3XKEJrfF31p3','spotnic.eu.auth0.com', {
      theme: {
        logo: "img/spotnic-logo.png",
        primaryColor: "#425cbb"
      },
      language: 'FR',
      languageDictionary: {
        title: ""
      },
      additionalSignUpFields: [
        {
          name: "firstname",
          placeholder: "Prénom",
          icon: "img/user.png",
        },
        {
          name: "lastname",
          placeholder: "Nom",
          icon: "img/user.png",
        },
        {
          name: "phone",
          placeholder: "06.XX.XX.XX.XX (facultatif)",
          // The following properties are optional
          icon: "img/smartphone.png",
          validator: function(val: string) {
            return {
              valid: true,
              // valid: val.length >= 10,
              hint: "Doit contenir au moins 10 chiffres" // optional
            };
          }
        },
      ]
  });

  //Store profile object in auth class
  userProfile: any;

  constructor() {
    console.log("# AuthService::constructor");

    // Set userProfile attribute of already saved profile
    if (localStorage.getItem('profile'))
      this.userProfile = JSON.parse(localStorage.getItem('profile'));
    else
      this.userProfile = this.defaultProfile();

    // Add callback for the Lock `authenticated` event
    this.lock.on("authenticated", (authResult: any) => {
      localStorage.setItem('id_token', authResult.idToken);

      // Fetch profile information
      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          // Handle error
          alert(error);
          return;
        }

        profile.firstname = "";
        profile.lastname = "";
        profile.phone = "";
        try {
          profile.firstname = profile.user_metadata.firstname;
          profile.lastname = profile.user_metadata.lastname;
          profile.phone = profile.user_metadata.phone;
        }
        catch (e) {}
        
        localStorage.setItem('profile', JSON.stringify(profile));
        this.userProfile = profile;
      });
    });
  };

  public login(initialScreen: string = 'login') {
    // Call the show method to display the widget.
    this.lock.show({
      initialScreen: initialScreen
    });
  };

  public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired();
  };

  public logout() {
    // Remove token from localStorage
    localStorage.removeItem('id_token');
  };

  public defaultProfile(): any {
    return {
      email: '',
      email_verified: false,
      clientID: '',
      user_metadata:{
        firstname: "",
        lastname: "",
        phone: ""
      },
      updated_at: "",
      name: "",
      picture: "",
      user_id: "",
      nickname: "",
      identities:[{
        user_id: "",
        provider: "",
        connection: "",
        isSocial:false
      }],
      created_at: "",
      global_client_id: "",
      firstname: "",
      lastname: "",
      phone: ""
    };
  }
}