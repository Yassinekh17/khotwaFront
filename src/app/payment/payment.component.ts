import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {

  constructor() { }
  handler:any = null;
  ngOnInit() {
 
    this.loadStripe();
  }
  color: string = 'light'; // Pour le thème du tableau
 
  pay(amount: any) {    
 
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_51L4DkLHZUiz3i8KObaiXx2OEt2IHxtLDnXnGwSipq7hUjH6n1bd8FCzP89lOyXxSOoheLo2vVQApkWUfZOkxam3h00JxH6oZFG',
      locale: 'auto',
      token: function (token: any) {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        console.log(token)
        alert('Token Created!!');
      }
    });
 
    handler.open({
      name: 'Demo Site',
      description: '2 widgets',
      amount: amount * 100
    });
 
  }
 
  loadStripe() {
     
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      s.onload = () => {
        this.handler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51L4DkLHZUiz3i8KObaiXx2OEt2IHxtLDnXnGwSipq7hUjH6n1bd8FCzP89lOyXxSOoheLo2vVQApkWUfZOkxam3h00JxH6oZFG',
          locale: 'auto',
          token: function (token: any) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            console.log(token)
            alert('Payment Success!!');
          }
        });
      }
       
      window.document.body.appendChild(s);
    }
  }
}
