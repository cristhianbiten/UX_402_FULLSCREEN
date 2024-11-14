sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "student10/com/sap/training/ux402/controls/HoverButton",
    "sap/m/MessageToast",
    "student10/com/sap/training/ux402/controls/PlaneInfo"
  ],
  function (Controller, HoverButton, MessageToast, PlaneInfo) {
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
