        // FIREBASE BUILT IN LOGIN UI
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {

                    return true;

                },
                uiShown: function () {
                }
            },
            // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
            signInFlow: 'popup',
            signInSuccessUrl: 'dashboard.html',
            signInOptions: [
                // Email authentication
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
            // Terms of service url.
            tosUrl: 'underconstruction.html',
            // Privacy policy url.
            privacyPolicyUrl: 'underconstruction.html'
        };

        // INJECTS FIREBASE PREBUILT LOGIN UI INTO PAGE
        ui.start('#firebaseui-auth-container', uiConfig);

        //Creates user node in database
        (function () {

            firebase.auth().onAuthStateChanged(function (user) {
                firebase.database().ref("users/" + user.uid).update({
                    "email": user.email
                });
            });
            
        })()