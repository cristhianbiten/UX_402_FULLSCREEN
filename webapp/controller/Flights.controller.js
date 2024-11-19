sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "student10/com/sap/training/ux402/controls/HoverButton",
    "sap/m/MessageToast",
    "student10/com/sap/training/ux402/controls/PlaneInfo",
    "sap/m/MessageBox",
  ],
  function (Controller, HoverButton, MessageToast, PlaneInfo, MessageBox) {
    "use strict";

    return Controller.extend(
      "student10.com.sap.training.ux402.fullscreen.ux402fullscreen.controller.Flights",
      {
        onInit: function () {
          var oRouter = this.getRouter();
          oRouter
            .getRoute("flights")
            .attachMatched(this._onObjectMatched, this);
        },

        getRouter: function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
          var oHistory = sap.ui.core.routing.History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.getRouter().navTo("overview", true /*no history*/);
          }
        },

        onHover: function (evt) {
          var sText = this.getOwnerComponent()
            .getModel("i18n")
            .getProperty("msgSeatsAv");
          MessageToast.show(evt.getSource().getHoverText() + " " + sText, {
            duration: 1000,
          });
        },

        onHoverPress: function (oEvent) {
          var carrid = oEvent.getSource().data("id");
          var fldate = oEvent.getSource().data("date");
          var connid = oEvent.getSource().data("connid");

          MessageBox.confirm(
            "Are you sure want to book this flight?",
            function (oAction) {
              if (sap.m.MessageBox.Action.OK === oAction) {
                var oEntry = {};
                oEntry.Carrid = carrid;
                oEntry.Connid = connid;
                oEntry.Fldate = fldate;
                oEntry.Counter = "1";
                oEntry.Bookid = "43535432";
                oEntry.Customid = "00003406";
                oEntry.Passname = "John Doe";

                var oModel = this.getOwnerComponent().getModel();
                var customerHeader = { "Content-Type": "application/json" };
                oModel.setHeaders(customerHeader);

                var that = this;
                Promise.all([this._createBookingEntry(oModel, oEntry)]).then(
                  that._handleBookingSuccess,
                  that._handleBookingError
                );
              }
            }.bind(this)
          );
        },

        _createBookingEntry: function (oModel, oEntry) {
          return new Promise(function (resolve, reject) {
            oModel.create("/UX_C_Booking_TP", oEntry, {
              success: function (oData, response) {
                resolve(oData.Bookid, response);
              },
              error: function (oError) {
                reject(oError);
              },
            });
          });
        },

        _onObjectMatched: function (oEvent) {
          var oArgs = oEvent.getParameter("arguments");
          this._sCarrierId = oArgs.carrid;
          var oView = this.getView();
          oView.bindElement({
            path: "/UX_C_Carrier_TP('" + this._sCarrierId + "')",
            events: {
              change: this._onBindingChange.bind(this),
              dataRequested: function () {
                oView.setBusy(true);
              },
              dataReceived: function () {
                oView.setBusy(false);
              },
            },
          });
        },

        _handleBookingSuccess: function (bookId, response) {
          MessageBox.alert(
            "Flight booked. Booking reference number is: " + bookId
          );
        },

        _handleBookingError: function (oError) {
          if (oError) {
            if (oError.responseText) {
              var oErrorMessage = JSON.parse(oError.responseText);
              MessageBox.alert(
                "Flight was not booked due to: " +
                  oErrorMessage.error.message.value
              );
            }
          }
        },

        _onBindingChange: function () {
          var oElementBinding = this.getView().getElementBinding();
          // No data for the binding
          if (oElementBinding && !oElementBinding.getBoundContext()) {
            this.getRouter().getTargets().display("notFound");
          }
        },
      }
    );
  }
);
