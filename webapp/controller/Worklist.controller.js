sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.seaco.zbooking.zbooking.controller.Worklist", {

		formatter: formatter,

		onInit: function () {
			var oModel = new JSONModel({
				lease: "",
				Customer: "",
				tableVisibility: false,
				unitTypeEditable: false,
				RequestedQuantity: false,
				SelectioMode: ""
			});
			this.setModel(oModel, "booking");

			this.getOwnerComponent().getModel().read("/Bookings", { 
				success: function (oData) {
					this.aLeaseData = oData.results;
				}.bind(this)
			});
			
			this.getOwnerComponent().getModel().read("/LocationSet", {
				success: function (oData) {
					this.aAvailableQuantiy = oData.results;
				}.bind(this)
			});

			var model = new sap.ui.model.json.JSONModel({
				items: [{
					ItemNo: "1",
					RequestedQuan: 1
				}, {
					ItemNo: "2",
					RequestedQuan: 1
				}, {
					ItemNo: "3",
					RequestedQuan: 1
				}, {
					ItemNo: "4",
					RequestedQuan: 1
				}, {
					ItemNo: "5",
					RequestedQuan: 1
				}]

			});
			this.getView().setModel(model);
		},

		onPressGetLease: function () {
			var aFilterItem = [];
			var sCustomer = this.getView().getModel("booking").getProperty("/Customer");
			// this.getOwnerComponent().getModel().read("/Bookings", {
			// success: function (oData) {

			if (!this._oLeaseDialog) {
				this._oLeaseDialog = sap.ui.xmlfragment("idLeaseSearchDialog",
					"com.seaco.zbooking.zbooking.view.fragments.LeaseDialog", this);
				this.getView().addDependent(this._oLeaseDialog);
			}

			if (sCustomer) {
				aFilterItem = this.aLeaseData.filter(function (oFilterItem) {
					return oFilterItem.Customer === sCustomer;
				});
				this.getView().getModel("booking").setProperty("/listLease", aFilterItem);
			} else {
				this.getView().getModel("booking").setProperty("/listLease", this.aLeaseData);
			}

			this._oLeaseDialog.open();
			// 	}.bind(this)
			// });
		},

		onPressConfirmSelectLease: function (oEvent) {
			var oTable = sap.ui.core.Fragment.byId("idLeaseSearchDialog", "idLeaseTable");
			var iSelectedIndex = oTable.getSelectedIndex();
			if (iSelectedIndex !== -1) {
				var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				var aLease = this.getView().getModel("booking").getProperty("/listLease");
				var aFilterItem = aLease.filter(function (oFilterItem) {
					return oFilterItem.Lease === oSelectedContext.getProperty("Lease");
				});
				this.getView().getModel("booking").setProperty("/lease", aFilterItem[0].Lease);
			}
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		onPressDialogCancel: function (oEvent) {
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		onValueHelpLeaseRequested: function () {

			if (!this._oLeaseDialog) {
				this._oLeaseDialog = sap.ui.xmlfragment("idLeaseSearchDialog",
					"com.seaco.zbooking.zbooking.view.fragments.LeaseDialog", this);
				this.getView().addDependent(this._oLeaseDialog);
			}

			this.getView().getModel("booking").setProperty("/listLease", this.aLeaseData);
			this._oLeaseDialog.open();

		},

		onPressGo: function (oEvent) {
			var bRB1 = this.byId("idRBOBS").getProperty("selected");
			var bRB2 = this.byId("idRBOUT").getProperty("selected");
			if (bRB1 || bRB2) {
				this.getView().getModel("booking").setProperty("/tableVisibility", true);
			} else {
				this.getView().getModel("booking").setProperty("/tableVisibility", false);
			}

			if (bRB1) {
				this.getView().getModel("booking").setProperty("/unitTypeEditable", false);
			} else {
			this.getView().getModel("booking").setProperty("/unitTypeEditable", true);
			}
		},
		
		onPressAvailability: function(oEvent){
			var bRB1 = this.byId("idRBOBS").getProperty("selected");
			var oTableObject = oEvent.getSource().getBindingContext().getObject();
			var sPath = oEvent.getSource().getBindingContext().sPath.split("/")[2];
			this.iDepoIndex = parseInt(sPath);
			if(oTableObject.Location){
			if (!this._oAvailableQuantityDialog) {
				this._oAvailableQuantityDialog = sap.ui.xmlfragment("idAvailableQuantityDialog",
					"com.seaco.zbooking.zbooking.view.fragments.AvailableQuantity", this);
				this.getView().addDependent(this._oAvailableQuantityDialog);
			}
			if(bRB1){
				this.getView().getModel("booking").setProperty("/SelectioMode", "Single");
			} else {
				this.getView().getModel("booking").setProperty("/SelectioMode", "Multi")
			}
			var aFilterItem = this.aAvailableQuantiy.filter(function (oFilterItem) {
					return oFilterItem.Location === oTableObject.Location;
				});
			this.getView().getModel("booking").setProperty("/availableQuantity", aFilterItem);
			this._oAvailableQuantityDialog.open();
	
			}
		},
		
		onPressConfirmSelectAvailableQuan: function(oEvent){
			
			this.getView().getModel("booking").setProperty("/RequestedQuantity", true);
		},
		
		onPressConfirmSelectDepo: function(){
			var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
			var iSelectedIndex = oTable.getSelectedIndex();
			if (iSelectedIndex !== -1) {
				var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				var aDepo = this.getView().getModel("booking").getProperty("/availableQuantity");
				var aFilterItem = aDepo.filter(function (oFilterItem) {
					return oFilterItem.DepoCode === oSelectedContext.getProperty("DepoCode");
				});
				var a = this.getView().getModel().getProperty("/items");
				a[this.iDepoIndex].DepoCode = aFilterItem[0].DepoCode;
				this._oAvailableQuantityDialog.close();
				this.getView().getModel().refresh();
				// this.getView().getModel().setProperty("/items", aFilterItem);

			} else {
				this._oAvailableQuantityDialog.close();
			}
		}

	});
});