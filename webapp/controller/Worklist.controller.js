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
			this.getOwnerComponent().getModel().setDeferredGroups(["ReadBookingItems"]);

			this.getOwnerComponent().getModel().read("/Bookings", {
				success: function (oData) {
					this.aLeaseData = oData.results;
				}.bind(this)
			});

			this.getOwnerComponent().getModel().read("/QuantitySet", {
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].ReqQuanEditable = false;
					}
					this.aAvailableQuantiy = oData.results;
				}.bind(this)
			});

			this.getOwnerComponent().getModel().read("/LocationSet", {
				success: function (oData) {
					this.aLocation = oData.results;
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
				this.getView().getModel("booking").setProperty("/Lease", aFilterItem[0].Lease);
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
			var sCustomer = this.getView().getModel("booking").getProperty("/Customer");
			var sLease = this.getView().getModel("booking").getProperty("/Lease");
			var itemsForRB1 = [{
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
			var itemsForRB2 = [{
				ItemNo: 1
			}, {
				ItemNo: 2
			}, {
				ItemNo: 3
			}, {
				ItemNo: 4
			}, {
				ItemNo: 5
			}];
			var bRB1 = this.byId("idRBOBS").getProperty("selected");
			var bRB2 = this.byId("idRBOUT").getProperty("selected");

			if (sLease && (bRB1 || bRB2)) {
				var aFilterItem = this.aLeaseData.filter(function (oFilterItem) {
					return (oFilterItem.Customer === sCustomer && oFilterItem.Lease === sLease);
				});
				this.getView().getModel("booking").setData(aFilterItem[0]);
				// this.getView().getModel("booking").setProperty("/Lease", aFilterItem[0].Lease);
				this.getView().getModel("booking").setProperty("/tableVisibility", true);
			} else {
				this.getView().getModel("booking").setProperty("/tableVisibility", false);
			}

			if (bRB1) {
				this.getView().getModel("booking").setProperty("/unitTypeEditable", false);
				this.getView().getModel().setProperty("/items", itemsForRB1);
			} else {
				this.getView().getModel("booking").setProperty("/unitTypeEditable", true);
				this.getView().getModel().setProperty("/items", itemsForRB2);
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
				// var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
				// oTable.getRows()[0].addStyleClass("bgcolor");   
				// sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable-rows-row0").addStyleClass("bgcolor");
				this._oAvailableQuantityDialog.open();
				var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
				oTable.getRows()[0].addStyleClass("bgcolor");  

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
			var bFlag = true,
				aNewSelectedIndices = [];
			var oTable = sap.ui.core.Fragment.byId("idAvailableQuantityDialog", "idAvailableQuantityTable");
			var a = this.getView().getModel().getProperty("/items");
			var aSelectedIndices = oTable.getSelectedIndices();
			// var aNewSelectedIndices = aSelectedIndices.slice(0);
			var oMainModel = this.getModel("booking");
			var iTableIndex = this.iDepoIndex;
			// var sSelectionMode = this.getView().getModel("booking").getProperty("/SelectioMode")
			if (aSelectedIndices.length > 0) {

				for (var k = 0; k < aSelectedIndices.length; k++) {

					var iQuanIndex = aSelectedIndices[k];
					var oSelectedQuanContext = oTable.getContextByIndex(iQuanIndex);
					var oSelectedAvailQuan = oMainModel.getProperty(oSelectedQuanContext.getPath());
					// oSelectedAvailQuan.RequestedQuan = parseInt(oSelectedAvailQuan.RequestedQuan);
					// if( !isNaN(oSelectedAvailQuan.RequestedQuan)){
					// if(oSelectedAvailQuan.RequestedQuan !== null){
					if (oSelectedAvailQuan.RequestedQuan !== "") {
						aNewSelectedIndices.push(aSelectedIndices.slice(k, k + 1));
						// var aSlice = Object.assign({},aSelectedIndices[k]);
						// } else {
						// oSelectedAvailQuan.RequestedQuan = parseInt(oSelectedAvailQuan.RequestedQuan);
						// }
						oSelectedAvailQuan.RequestedQuan = parseInt(oSelectedAvailQuan.RequestedQuan, 10);
						if (oSelectedAvailQuan.RequestedQuan > oSelectedAvailQuan.AvailableQuan) {
							oTable.getRows()[iQuanIndex].getCells()[2].setValueState("Error");
							oTable.getRows()[iQuanIndex].getCells()[2].setValueStateText("Requested Quantity should not be more than Available Quantity");
							bFlag = false;
							break;

						} else {
							oTable.getRows()[iQuanIndex].getCells()[2].setValueState("None");
						}
					} else {
						oTable.getRows()[iQuanIndex].getCells()[2].setValueState("None");
					}
					// }
				}
				aSelectedIndices = aNewSelectedIndices;
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
				if (bFlag) {
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
						if (!isNaN(oSelectedAvailQuan.RequestedQuan)) {
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
					for (var j = 0; j < a.length; j++) {
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
		},

		onValueHelpCustRequested: function (oEvent) {
			if (!this._oCustomerDialog) {
				this._oCustomerDialog = sap.ui.xmlfragment("idCustomerSearchDialog",
					"com.seaco.zbooking.zbooking.view.fragments.CustomerDialog", this);
				this.getView().addDependent(this._oCustomerDialog);
			}
			this.getView().getModel("booking").setProperty("/listCustomer", this.aLeaseData);
			this._oCustomerDialog.open();
		},

		onPressConfirmSelectCustomer: function (oEvent) {
			var oTable = sap.ui.core.Fragment.byId("idCustomerSearchDialog", "idCustomerTable");
			var iSelectedIndex = oTable.getSelectedIndex();
			if (iSelectedIndex !== -1) {
				var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				var aLease = this.getView().getModel("booking").getProperty("/listCustomer");
				var aFilterItem = aLease.filter(function (oFilterItem) {
					return oFilterItem.Customer === oSelectedContext.getProperty("Customer");
				});
				this.getView().getModel("booking").setProperty("/Customer", aFilterItem[0].Customer);
			}
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		onCustomerSearch: function (oEvent) {
			var aFilters = [];
			var aFilterItems = oEvent.getSource().getAllFilterItems(true);
			aFilterItems.forEach(function (oFilterItem) {
				var oControl = oFilterItem.getControl();
				if (oControl.getValue()) {
					aFilters.push(new Filter({
						path: oFilterItem.getName(),
						operator: FilterOperator.EQ,
						value1: oControl.getValue()
					}));
				}
			});
			var oTable = sap.ui.core.Fragment.byId("idCustomerSearchDialog", "idCustomerTable");
			oTable.getBinding("rows").filter(aFilters);
		},

		onValueHelpLocationRequested: function (oEvent) {
			this.getView().getModel("booking").setProperty("/Location", this.aLocation);
			var oTableObject = oEvent.getSource().getBindingContext().getObject();
			var sPath = oEvent.getSource().getBindingContext().sPath.split("/")[2];
			// var a = oEvent.getSource().getId();
			// var sIndex = a[a.length - 1];
			this.iLocationIndex = parseInt(sPath, 10);
			if (!this._oLocationSearchDialog) {
				this._oLocationSearchDialog = sap.ui.xmlfragment("idLocationSearchDialog",
					"com.seaco.zbooking.zbooking.view.fragments.LocationSearchDialog", this);
				this.getView().addDependent(this._oLocationSearchDialog);
			}
			this._oLocationSearchDialog.open();
		},

		onPressConfirmSelectLocation: function (oEvent) {
			var oTable = sap.ui.core.Fragment.byId("idLocationSearchDialog", "idLocationTable");
			var iSelectedIndex = oTable.getSelectedIndex();
			if (iSelectedIndex !== -1) {
				var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				var oSelectedContext = oTable.getContextByIndex(iSelectedIndex);
				var aLocation = this.getView().getModel("booking").getProperty("/Location");
				var aFilterItem = aLocation.filter(function (oFilterItem) {
					return oFilterItem.LocationCode === oSelectedContext.getProperty("LocationCode");
				});
				var a = this.getView().getModel().getProperty("/items");
				a[this.iLocationIndex].Location = aFilterItem[0].Country;
				this.getView().getModel().refresh();
				// this.getView().getModel().setProperty("/items", aFilterItem);

			}
			oEvent.getSource().getParent().getParent().getParent().close();
		},

		onValidate: function () {
			var bRB1 = this.byId("idRBOBS").getProperty("selected");
			if (bRB1) {
				var aTableItems = this.getView().byId("idTable").getModel().getData("items").items;
				for (var z = 0; z < aTableItems.length; z++) {
					if (aTableItems[z].SerialNo != undefined) {
						aTableItems[z].SerialNo = aTableItems[z].SerialNo.trim();
						this.getView().byId("idTable").getRows()[z].removeStyleClass("bgcolor");
					}
				}
				var i, bFlag;

				this.getOwnerComponent().getModel().read("/BookingItems", {
					success: function (oData) {
						var aResults = oData.results;
						for (var i = 0; i < aTableItems.length; i++) {
							for (var j = 0; j < aResults.length; j++) {
								if (aTableItems[i].SerialNo === undefined) {
									break;
								} else if (aResults[j].SerialNo === aTableItems[i].SerialNo) {
									aTableItems[i].Status = "Success";
									bFlag = true;
									break;

								} else {
									aTableItems[i].Status = "Error";
									bFlag = false;
								}
								// }
							}
						}
						if (!bFlag) {
							this.initializeMessageManager(this.getView().getModel());
							var oMessageManager = this.getMessageManager();
							oMessageManager.removeAllMessages();
							// var oTable = this.getView().byId("idTable").getModel().getData("items").items;
							for (i = 0; i < aTableItems.length; i++) {
								if (aTableItems[i] != undefined) {
									if (aTableItems[i].Status === "Error") {
										var sErrorText = "Error for" + " " + aTableItems[i].SerialNo;
										var oViewModel = this.getView().getModel();
										this.addMessages(aTableItems[i].Status, sErrorText, sErrorText, oViewModel);
									}
								}

							}
							this._showMessageCount();
							// this.getMessageManager.registerObject(this.getView().byId("idPanel"), true);
							this.getView().setModel(this.getMessageModel(), "message");
							this.getView().getModel().refresh();
						} else {
							// var oTable = this.getView().byId("idTable").getModel().getData("items").items;
							for (i = 0; i < aTableItems.length; i++) {
								if (aTableItems[i].SerialNo != undefined) {
									var sSerialNo = aTableItems[i].SerialNo;
									var sOdataKey = this.getOwnerComponent().getModel().createKey("BookingItems", {
										SerialNo: sSerialNo,
									});

									var sPath = "/" + sOdataKey;
									this.getOwnerComponent().getModel().read(sPath, {
										groupId: "ReadBookingItems"
									});
								}
							}
							this.getOwnerComponent().getModel().submitChanges({
								groupId: "ReadBookingItems",
								success: function (oData) {
									var i;
									var a = [];
									for (i = 0; i < oData.__batchResponses.length; i++) {
										if (oData.__batchResponses[i] != undefined) {
											a[i] = oData.__batchResponses[i].data;
										}
									}
									var oTableLength = a.length;
									// for (var k = 0; k < iNumber; k++) {
									// 	var y = {
									// 		Status: "",
									// 		City: "",
									// 		Flag: true
									// 	};
									// 	a[oTableLength] = y;
									// 	oTableLength++;
									// }
									this.getView().getModel().setProperty("/items", a);
									this.initializeMessageManager(this.getView().getModel());
									var oMessageManager = this.getMessageManager();
									// i;
									oMessageManager.removeAllMessages();
									var oTable = this.getView().byId("idTable").getModel().getData("items").items;
								}.bind(this),
								error: function (oError) {}
							});
						}
						// this.getView().getModel().setProperty("/items", aTableItems);
					}.bind(this)

				});
				// }
			}
		},

		_showMessageCount: function () {
			var oData, oViewModel = this.getModel("data"),
				i;
			if (!this._aMessages) {
				this._aMessages = [];

			}
			oData = this.getMessageModel().getData();
			for (i = 0; i < oData.length; i++) {
				this._aMessages.push(oData[i]);
			}
			this.getView().getModel("message").setProperty("/", this._aMessages);
			oViewModel.setProperty("/Errors/NoOfErrors", oData.length);
			if (oData.length > 0) {
				oViewModel.setProperty("/Errors/visible", true);
			} else {
				oViewModel.setProperty("/Errors/visible", false);
			}
		},

		handleMessagePopoverPress: function (oEvent) {
			if (!this.oErrorPopover) {
				this.oErrorPopover = sap.ui.xmlfragment("com.seaco.zbooking.zbooking.view.fragments.MessagePopover", this);
			}
			this.getView().addDependent(this.oErrorPopover);
			if (!this.oErrorPopover.isOpen()) {
				this.oErrorPopover.openBy(oEvent.getSource());
			} else {
				this.oErrorPopover.close();
			}
		},

		activeTitle: function (oEvent) {
			var that = this;
			var oItem = oEvent.getParameter("item"),
				oPage = that.oView.byId("page"),
				oMessage = oItem.getBindingContext("message").getObject();
			var sSerialNo = oItem.getBindingContext("message").getObject().description.split(" ")[2];
			var aTable = this.getView().getModel().getData("/items").items;
			for (var i = 0; i < aTable.length; i++) {
				if (aTable[i].SerialNo === sSerialNo) {
					var iIndex = i;
				}
			}
			for (var i = 0; i < aTable.length; i++) {
				if (i === iIndex) {
					// aTable[iIndex].Colour = "true";
					this.getView().byId("idTable").getRows()[iIndex].addStyleClass("bgcolor");

				} else {
					this.getView().byId("idTable").getRows()[i].removeStyleClass("bgcolor");

				}
			}
			this.getView().getModel().setProperty("/items", aTable);
			this.oErrorPopover.close();
		},

		onSave: function () {
			var oTable = this.getView().byId("idTable").getRows();
			var i, bFlag = true;
			this.initializeMessageManager(this.getView().getModel());
			var oMessageManager = this.getMessageManager();
			oMessageManager.removeAllMessages();
			for (var j = 0; j < oTable.length; j++) {
				if (oTable[j].getBindingContext() !== null && (oTable[j].getBindingContext().getObject().ProductType === 'Tank' && oTable[j].getBindingContext()
						.getObject().LastCargo === undefined)) {
					this.getView().byId("idTable").getRows()[j].getCells("LastCargo")[8].setValueState("Error");
					this.getView().byId("idTable").getRows()[j].getCells("LastCargo")[8].setValueStateText("Please enter Last Cargo");
					bFlag = false;
					break;
				} else {
					this.getView().byId("idTable").getRows()[j].getCells("LastCargo")[8].setValueState("None");
				}
			}
			if (bFlag) {
				for (i = 0; i < oTable.length; i++) {
					if (oTable[i].getBindingContext() !== null) {
						oTable[i].getBindingContext().getObject().Flag = false;
					}
				}
				this.getView().getModel().refresh();
				// this.getView().getModel("data").setProperty("/editDelete", true);
			}
		}

	});
});