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
				// RequestedQuantity: false
				// SelectioMode: ""
			});
			this.setModel(oModel, "booking");

			this.getOwnerComponent().getModel().read("/Bookings", {
				success: function (oData) {
					this.aLeaseData = oData.results;
				}.bind(this)
			});

			this.getOwnerComponent().getModel().read("/LocationSet", {
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].ReqQuanEditable = false;
					}
					this.aAvailableQuantiy = oData.results;
				}.bind(this)
			});

			var model = new sap.ui.model.json.JSONModel({
				items: [{
					ItemNo: 1,
					RequestedQuan: 1
				}, {
					ItemNo: 2,
					RequestedQuan: 1
				}, {
					ItemNo: 3,
					RequestedQuan: 1
				}, {
					ItemNo: 4,
					RequestedQuan: 1
				}, {
					ItemNo: 5,
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
		var	items= [{
					ItemNo: 1,
					RequestedQuan: 1
				}, {
					ItemNo: 2,
					RequestedQuan: 1
				}, {
					ItemNo: 3,
					RequestedQuan: 1
				}, {
					ItemNo: 4,
					RequestedQuan: 1
				}, {
					ItemNo: 5,
					RequestedQuan: 1
				}];
			var bRB1 = this.byId("idRBOBS").getProperty("selected");
			var bRB2 = this.byId("idRBOUT").getProperty("selected");
			if (bRB1 || bRB2) {
				this.getView().getModel("booking").setProperty("/tableVisibility", true);
			} else {
				this.getView().getModel("booking").setProperty("/tableVisibility", false);
			}

			if (bRB1) {
				this.getView().getModel("booking").setProperty("/unitTypeEditable", false);
				this.getView().getModel().setProperty("/items", items);
			} else {
				this.getView().getModel("booking").setProperty("/unitTypeEditable", true);
				this.getView().getModel().setProperty("/items", items);
			}
		},

		onPressAvailability: function (oEvent) {
			// var bRB1 = this.byId("idRBOBS").getProperty("selected");
			var oTableObject = oEvent.getSource().getBindingContext().getObject();
			var sPath = oEvent.getSource().getBindingContext().sPath.split("/")[2];
			this.iDepoIndex = parseInt(sPath);
			if (oTableObject.Location) {
				// if (bRB1) {
				// 	this.getView().getModel("booking").setProperty("/SelectioMode", "Single");
				// } else {
				// 	this.getView().getModel("booking").setProperty("/SelectioMode", "Multi");
				// }
				if (!this._oAvailableQuantityDialog) {
					this._oAvailableQuantityDialog = sap.ui.xmlfragment("idAvailableQuantityDialog",
						"com.seaco.zbooking.zbooking.view.fragments.AvailableQuantity", this);
					this.getView().addDependent(this._oAvailableQuantityDialog);
				}
				var aFilterItem = this.aAvailableQuantiy.filter(function (oFilterItem) {
					return oFilterItem.Location === oTableObject.Location;
				});
				this.getView().getModel("booking").setProperty("/availableQuantity", aFilterItem);
				this._oAvailableQuantityDialog.open();

			}
		},

		onPressConfirmSelectAvailableQuan: function (oEvent) {

			this.getView().getModel("booking").setProperty("/RequestedQuantity", true);
			var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
			var aSelectedIndices = oTable.getSelectedIndex();
			// aSelectedIndices.forEach(function (oSelectedIndice){
			// var iIndex = oSelectedIndice;
			oTable.getRows()[aSelectedIndices].getBindingContext("booking").getObject().ReqQuanEditable = true;
			this.getView().getModel().refresh();
			// });

		},

		onPressConfirmSelectDepo: function (oEvent) {
			var bFlag = true;
			var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
			var a = this.getView().getModel().getProperty("/items");
			var aSelectedIndices = oTable.getSelectedIndices();
			var oMainModel = this.getModel("booking");
			var iTableIndex = this.iDepoIndex;
			// var sSelectionMode = this.getView().getModel("booking").getProperty("/SelectioMode")
			if (aSelectedIndices.length > 0) {
				
				for(var k = 0; k < aSelectedIndices.length; k++){
					var aSlice = aSelectedIndices;
					var iQuanIndex = aSelectedIndices[k];
						var oSelectedQuanContext = oTable.getContextByIndex(iQuanIndex);
						var oSelectedAvailQuan = oMainModel.getProperty(oSelectedQuanContext.getPath());
						if(oSelectedAvailQuan.RequestedQuan === null){
							aSlice.splice(aSlice[k],1);
							// var aSlice = Object.assign({},aSelectedIndices[k]);
						} else {
						oSelectedAvailQuan.RequestedQuan = parseInt(oSelectedAvailQuan.RequestedQuan);
						// }
						// oSelectedAvailQuan.RequestedQuan = parseInt(oSelectedAvailQuan.RequestedQuan);
						if(oSelectedAvailQuan.RequestedQuan > oSelectedAvailQuan.AvailableQuan){
							oTable.getRows()[iQuanIndex].getCells()[2].setValueState("Error");
							oTable.getRows()[iQuanIndex].getCells()[2].setValueStateText("Requested Quantity should not be more than Available Quantity");
							bFlag = false;
							break;

						} else {
							oTable.getRows()[iQuanIndex].getCells()[2].setValueState("None");
						}
						}
				}
				aSelectedIndices = aSlice;
				// if (aSelectedIndices.length < 1) {
				// 	var iSelectedIndex = oTable.getSelectedIndex();
				// 	var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				// 	var aDepo = this.getView().getModel("booking").getProperty("/availableQuantity");
				// 	var aFilterItem = aDepo.filter(function (oFilterItem) {
				// 		return oFilterItem.DepoCode === oSelectedContext.getProperty("DepoCode");
				// 	});

				// 	a[this.iDepoIndex].DepoCode = aFilterItem[0].DepoCode;
				// 	this._oAvailableQuantityDialog.close();
				// 	this.getView().getModel().refresh();
				// 	// this.getView().getModel().setProperty("/items", aFilterItem);
				// } else {
					// aSelectedIndices.forEach(function (oSelectedIndice) {
					if (bFlag){
					for (var i = 0; i < aSelectedIndices.length; i++) {
						var iIndex = aSelectedIndices[i];
						var oSelectedContext = oTable.getContextByIndex(iIndex);
						 oSelectedAvailQuan = oMainModel.getProperty(oSelectedContext.getPath());
						// oNewlySelectedWorkCenters.RequestedQuan = parseInt(oNewlySelectedWorkCenters.RequestedQuan);
						// if(oNewlySelectedWorkCenters.RequestedQuan > oNewlySelectedWorkCenters.AvailableQuan){
						// 	oTable.getRows()[iIndex].getCells()[2].setValueState("Error");
						// 	break;

						// } else {
						// 	oTable.getRows()[iIndex].getCells()[2].setValueState("None");
						if(!isNaN(oSelectedAvailQuan.RequestedQuan))  {
						var oNewTableItems = {
							Location: a[this.iDepoIndex].Location,
							SerialNo: a[this.iDepoIndex].SerialNo,
							UnitType: a[this.iDepoIndex].UnitType,
							DepoCode: oSelectedAvailQuan.DepoCode,
							RequestedQuan: oSelectedAvailQuan.RequestedQuan
						};
						if (i === 0) {
							// oNewWorkCenter.ItemNo = a[this.iDepoIndex].ItemNo;
							a.splice(this.iDepoIndex, 1, oNewTableItems);
						} else {
							// oNewWorkCenter.ItemNo = a[this.iDepoIndex].ItemNo + 1;
							a.splice(iTableIndex + 1, 0, oNewTableItems);
						}
						}
						// aNewlySelectedWorkCenters.push(oNewWorkCenter);
					}
					for(var j=0; j<a.length; j++){
						a[j].ItemNo = j + 1;
					}

					this.getView().getModel().refresh();
					this._oAvailableQuantityDialog.close();
			}
					// for(var j=0; j<a.length; j++){
					// 	a[j].ItemNo = j + 1;
					// }

					// this.getView().getModel().refresh();
					// this._oAvailableQuantityDialog.close();
				// }

			} else {
				this._oAvailableQuantityDialog.close();
			}
		},

		onQuantityChange: function (oEvent) {
			var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
			var oValue = oEvent.getSource().getValue();
			var iIndex = oEvent.getSource().getParent().getIndex();
			var oContextProperty = oTable.getContextByIndex(iIndex).getProperty();
			if (oContextProperty.AvailableQuan < oContextProperty.RequestedQuan) {
				oTable.getRows()[iIndex].getCells()[2].setValueState("Error");
			} else {
				oTable.getRows()[iIndex].getCells()[2].setValueState("None");
			}
		}

	});
});