package registrationSimulator_fla
{
   import adobe.utils.*;
   import edu.unl.astro.starField.*;
   import fl.controls.Button;
   import fl.controls.CheckBox;
   import fl.controls.RadioButton;
   import fl.controls.RadioButtonGroup;
   import fl.controls.TextInput;
   import flash.accessibility.*;
   import flash.display.*;
   import flash.errors.*;
   import flash.events.*;
   import flash.external.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.media.*;
   import flash.net.*;
   import flash.printing.*;
   import flash.system.*;
   import flash.text.*;
   import flash.ui.*;
   import flash.utils.*;
   import flash.xml.*;
   
   public dynamic class MainTimeline extends MovieClip
   {
      
      public var showStarField1CheckBox:CheckBox;
      
      public var showStarField3CheckBox:CheckBox;
      
      public var noFieldOnTopRadioButton:RadioButton;
      
      public var starField1BorderSP:Sprite;
      
      public var workAreaSP:Sprite;
      
      public var starField3BorderSP:Sprite;
      
      public var positionLimitsRect:Rectangle;
      
      public var gammaTF:GammaTransferFunction;
      
      public var advanceButton:Button;
      
      public var saturationMagnitude:*;
      
      public var workAreaRect:Rectangle;
      
      public var numStars:uint;
      
      public var workAreaMargin:int;
      
      public var onTopRadioButtonGroup:RadioButtonGroup;
      
      public var starsList:Array;
      
      public var airyDisc:AiryDisc;
      
      public var invertColorsCheckBox:CheckBox;
      
      public var positionBuffer:int;
      
      public var field1OnTopRadioButton:RadioButton;
      
      public var field2OnTopRadioButton:RadioButton;
      
      public var field3OnTopRadioButton:RadioButton;
      
      public var useAlphaCheckBox:CheckBox;
      
      public var magnitudeRange:Number;
      
      public var starField2BorderSP:Sprite;
      
      public var xOffset3TextInput:TextInput;
      
      public var showStarField2CheckBox:CheckBox;
      
      public var yOffset3TextInput:TextInput;
      
      public var xDraggingOffset:int;
      
      public var starField1:StarField;
      
      public var starField2:StarField;
      
      public var starField3:StarField;
      
      public var yDraggingOffset:int;
      
      public var starFieldMargin:int;
      
      public var starFieldDimensions:Object;
      
      public var draggingTarget:Sprite;
      
      public var starFieldsMaskSP:Sprite;
      
      public var starFieldsContainerSP:Sprite;
      
      public var yOffset2TextInput:TextInput;
      
      public var xOffset2TextInput:TextInput;
      
      public function MainTimeline()
      {
         super();
         addFrameScript(0,frame1);
         __setProp_field2OnTopRadioButton_Scene1_Layer1_1();
         __setProp_yOffset2TextInput_Scene1_Layer1_1();
         __setProp_xOffset3TextInput_Scene1_Layer1_1();
         __setProp_xOffset2TextInput_Scene1_Layer1_1();
         __setProp_showStarField2CheckBox_Scene1_Layer1_1();
         __setProp_invertColorsCheckBox_Scene1_Layer1_1();
         __setProp_showStarField3CheckBox_Scene1_Layer1_1();
         __setProp_yOffset3TextInput_Scene1_Layer1_1();
         __setProp_field1OnTopRadioButton_Scene1_Layer1_1();
         __setProp_noFieldOnTopRadioButton_Scene1_Layer1_1();
         __setProp_showStarField1CheckBox_Scene1_Layer1_1();
         __setProp_advanceButton_Scene1_Layer1_1();
         __setProp_useAlphaCheckBox_Scene1_Layer1_1();
         __setProp_field3OnTopRadioButton_Scene1_Layer1_1();
      }
      
      public function updatePositionTextInputs() : void
      {
         xOffset2TextInput.text = Math.round(starField2.x - starField1.x).toString();
         yOffset2TextInput.text = Math.round(starField2.y - starField1.y).toString();
         xOffset3TextInput.text = Math.round(starField3.x - starField1.x).toString();
         yOffset3TextInput.text = Math.round(starField3.y - starField1.y).toString();
      }
      
      public function onStarField3ChangeViaTextInput(... rest) : void
      {
         changeStarFieldPosition(3,{
            "x":starField1.x + parseFloat(xOffset3TextInput.text),
            "y":starField1.y + parseFloat(yOffset3TextInput.text)
         });
      }
      
      internal function frame1() : *
      {
         starFieldDimensions = {
            "width":400,
            "height":300
         };
         positionBuffer = -10;
         workAreaMargin = 50;
         starFieldMargin = 35;
         workAreaRect = new Rectangle(14,61,starFieldDimensions.width + 2 * workAreaMargin,starFieldDimensions.height + 2 * workAreaMargin);
         positionLimitsRect = new Rectangle();
         positionLimitsRect.left = workAreaRect.left - positionBuffer;
         positionLimitsRect.top = workAreaRect.top - positionBuffer;
         positionLimitsRect.right = workAreaRect.right - starFieldDimensions.width + positionBuffer;
         positionLimitsRect.bottom = workAreaRect.bottom - starFieldDimensions.height + positionBuffer;
         onTopRadioButtonGroup = new RadioButtonGroup("onTopGroup");
         field1OnTopRadioButton.group = onTopRadioButtonGroup;
         field2OnTopRadioButton.group = onTopRadioButtonGroup;
         field3OnTopRadioButton.group = onTopRadioButtonGroup;
         noFieldOnTopRadioButton.group = onTopRadioButtonGroup;
         onTopRadioButtonGroup.addEventListener("change",onTopFieldChangedViaRadioButton);
         noFieldOnTopRadioButton.enabled = false;
         noFieldOnTopRadioButton.visible = false;
         showStarField1CheckBox.addEventListener("change",onStarFieldVisibilityToggled);
         showStarField2CheckBox.addEventListener("change",onStarFieldVisibilityToggled);
         showStarField3CheckBox.addEventListener("change",onStarFieldVisibilityToggled);
         useAlphaCheckBox.addEventListener("change",updateFieldAlphas);
         invertColorsCheckBox.addEventListener("change",onInvertColorsToggled);
         stage.addEventListener("keyDown",onKeyDownFunc);
         advanceButton.addEventListener("click",goToNextVisibleField);
         xOffset2TextInput.addEventListener("focusOut",onStarField2ChangeViaTextInput);
         xOffset2TextInput.addEventListener("enter",onStarField2ChangeViaTextInput);
         yOffset2TextInput.addEventListener("focusOut",onStarField2ChangeViaTextInput);
         yOffset2TextInput.addEventListener("enter",onStarField2ChangeViaTextInput);
         xOffset3TextInput.addEventListener("focusOut",onStarField3ChangeViaTextInput);
         xOffset3TextInput.addEventListener("enter",onStarField3ChangeViaTextInput);
         yOffset3TextInput.addEventListener("focusOut",onStarField3ChangeViaTextInput);
         yOffset3TextInput.addEventListener("enter",onStarField3ChangeViaTextInput);
         starFieldsContainerSP = new Sprite();
         starFieldsMaskSP = new Sprite();
         starFieldsMaskSP.graphics.clear();
         starFieldsMaskSP.graphics.beginFill(16711680,0);
         starFieldsMaskSP.graphics.drawRect(workAreaRect.x,workAreaRect.y,workAreaRect.width,workAreaRect.height);
         starFieldsMaskSP.graphics.endFill();
         starFieldsContainerSP.mask = starFieldsMaskSP;
         workAreaSP = new Sprite();
         workAreaSP.graphics.clear();
         workAreaSP.graphics.beginFill(16777215,1);
         workAreaSP.graphics.lineStyle(1,6710886);
         workAreaSP.graphics.drawRect(workAreaRect.x,workAreaRect.y,workAreaRect.width,workAreaRect.height);
         workAreaSP.graphics.endFill();
         gammaTF = new GammaTransferFunction();
         airyDisc = new AiryDisc(4);
         saturationMagnitude = 3;
         starsList = [];
         magnitudeRange = 4;
         numStars = 50;
         generateStarList();
         starField1 = new StarField();
         starField1.x = workAreaRect.x + workAreaMargin;
         starField1.y = workAreaRect.y + workAreaMargin;
         starField1.noiseSeed = 7;
         initStarField(starField1,false,{
            "x":0,
            "y":0
         });
         starField2 = new StarField();
         starField2.x = workAreaRect.x + 75;
         starField2.y = workAreaRect.y + 15;
         starField1.noiseSeed = 5007;
         initStarField(starField2,true,{
            "x":35,
            "y":-29
         });
         starField3 = new StarField();
         starField3.x = workAreaRect.x + 23;
         starField3.y = workAreaRect.y + 60;
         starField1.noiseSeed = 10071;
         initStarField(starField3,true,{
            "x":15,
            "y":21
         });
         starField1BorderSP = new Sprite();
         starField1.addChild(starField1BorderSP);
         starField2BorderSP = new Sprite();
         starField2.addChild(starField2BorderSP);
         starField3BorderSP = new Sprite();
         starField3.addChild(starField3BorderSP);
         addChild(workAreaSP);
         addChild(starFieldsContainerSP);
         addChild(starFieldsMaskSP);
         starField2.visible = false;
         starField3.visible = false;
         field2OnTopRadioButton.enabled = false;
         field3OnTopRadioButton.enabled = false;
         onTopRadioButtonGroup.selectedData = "1";
         onTopFieldChangedViaRadioButton();
         updatePositionTextInputs();
      }
      
      public function onStarFieldVisibilityToggled(param1:Event) : void
      {
         var _loc2_:String = null;
         var _loc3_:Sprite = null;
         if(param1.target == showStarField1CheckBox)
         {
            _loc2_ = "1";
         }
         else if(param1.target == showStarField2CheckBox)
         {
            _loc2_ = "2";
         }
         else
         {
            if(param1.target != showStarField3CheckBox)
            {
               return;
            }
            _loc2_ = "3";
         }
         _loc3_ = this["starField" + _loc2_];
         _loc3_.visible = param1.target.selected;
         if(_loc3_.visible)
         {
            onTopRadioButtonGroup.selectedData = _loc2_;
         }
         else if(onTopRadioButtonGroup.selectedData == _loc2_)
         {
            goToNextVisibleField();
         }
         this["field" + _loc2_ + "OnTopRadioButton"].enabled = _loc3_.visible;
      }
      
      public function onStarField2ChangeViaTextInput(... rest) : void
      {
         changeStarFieldPosition(2,{
            "x":starField1.x + parseFloat(xOffset2TextInput.text),
            "y":starField1.y + parseFloat(yOffset2TextInput.text)
         });
      }
      
      public function initStarField(param1:StarField, param2:Boolean, param3:Object) : void
      {
         var _loc4_:Object = null;
         param1.lock();
         param1.dimensions = starFieldDimensions;
         param1.transferFunction = gammaTF;
         param1.noiseMean = 2418;
         param1.noiseSigma = 432;
         param1.saturationMagnitude = saturationMagnitude;
         param1.psf = airyDisc;
         for each(_loc4_ in starsList)
         {
            param1.addStar(new Star({
               "x":_loc4_.x + param3.x,
               "y":_loc4_.y + param3.y,
               "magnitude":_loc4_.magnitude
            }));
         }
         param1.unlock();
         starFieldsContainerSP.addChild(param1);
         param1.addEventListener(MouseEvent.MOUSE_DOWN,onStarFieldPressed);
         param1.alpha = 1;
      }
      
      public function generateStarList() : void
      {
         var _loc1_:Number = NaN;
         var _loc2_:Number = NaN;
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         var _loc6_:Number = NaN;
         var _loc7_:int = 0;
         _loc1_ = -starFieldMargin;
         _loc2_ = starFieldDimensions.width + starFieldMargin;
         _loc3_ = -starFieldMargin;
         _loc4_ = starFieldDimensions.height + starFieldMargin;
         _loc5_ = _loc2_ - _loc1_;
         _loc6_ = _loc4_ - _loc3_;
         _loc7_ = 0;
         while(_loc7_ < numStars)
         {
            starsList.push({
               "x":_loc1_ + _loc5_ * Math.random(),
               "y":_loc3_ + _loc6_ * Math.random(),
               "magnitude":saturationMagnitude + magnitudeRange * Math.random()
            });
            _loc7_++;
         }
      }
      
      public function onKeyDownFunc(param1:KeyboardEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:Sprite = null;
         var _loc4_:Object = null;
         if(param1.keyCode == 65 || param1.keyCode == 97)
         {
            goToNextVisibleField();
         }
         _loc2_ = int(onTopRadioButtonGroup.selectedData);
         if(_loc2_ == 2 || _loc2_ == 3)
         {
            _loc3_ = this["starField" + _loc2_.toString()];
            _loc4_ = {
               "x":_loc3_.x,
               "y":_loc3_.y
            };
            if(param1.keyCode == 37)
            {
               --_loc4_.x;
               changeStarFieldPosition(_loc2_,_loc4_);
            }
            else if(param1.keyCode == 38)
            {
               --_loc4_.y;
               changeStarFieldPosition(_loc2_,_loc4_);
            }
            else if(param1.keyCode == 39)
            {
               ++_loc4_.x;
               changeStarFieldPosition(_loc2_,_loc4_);
            }
            else if(param1.keyCode == 40)
            {
               ++_loc4_.y;
               changeStarFieldPosition(_loc2_,_loc4_);
            }
         }
      }
      
      public function onTopFieldChangedViaRadioButton(... rest) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:uint = 0;
         var _loc4_:Number = NaN;
         var _loc5_:uint = 0;
         var _loc6_:Graphics = null;
         var _loc7_:int = 0;
         if(onTopRadioButtonGroup.selectedData == null || onTopRadioButtonGroup.selectedData == "none")
         {
            return;
         }
         starFieldsContainerSP.setChildIndex(this["starField" + onTopRadioButtonGroup.selectedData],starFieldsContainerSP.numChildren - 1);
         _loc2_ = 3;
         _loc3_ = 16748688;
         _loc4_ = 2;
         _loc5_ = 9474192;
         _loc7_ = 1;
         while(_loc7_ <= 3)
         {
            _loc6_ = this["starField" + _loc7_ + "BorderSP"].graphics;
            _loc6_.clear();
            if(_loc7_ == int(onTopRadioButtonGroup.selectedData))
            {
               _loc6_.lineStyle(3,16748688);
            }
            else
            {
               _loc6_.lineStyle(2,9474192);
            }
            _loc6_.drawRect(0,0,starFieldDimensions.width,starFieldDimensions.height);
            _loc7_++;
         }
         updateFieldAlphas();
      }
      
      internal function __setProp_yOffset3TextInput_Scene1_Layer1_1() : *
      {
         try
         {
            yOffset3TextInput["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         yOffset3TextInput.displayAsPassword = false;
         yOffset3TextInput.editable = true;
         yOffset3TextInput.enabled = true;
         yOffset3TextInput.maxChars = 3;
         yOffset3TextInput.restrict = "-0-9";
         yOffset3TextInput.text = "0";
         yOffset3TextInput.visible = true;
         try
         {
            yOffset3TextInput["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_xOffset3TextInput_Scene1_Layer1_1() : *
      {
         try
         {
            xOffset3TextInput["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         xOffset3TextInput.displayAsPassword = false;
         xOffset3TextInput.editable = true;
         xOffset3TextInput.enabled = true;
         xOffset3TextInput.maxChars = 3;
         xOffset3TextInput.restrict = "-0-9";
         xOffset3TextInput.text = "0";
         xOffset3TextInput.visible = true;
         try
         {
            xOffset3TextInput["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_showStarField1CheckBox_Scene1_Layer1_1() : *
      {
         try
         {
            showStarField1CheckBox["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         showStarField1CheckBox.enabled = true;
         showStarField1CheckBox.label = "";
         showStarField1CheckBox.labelPlacement = "right";
         showStarField1CheckBox.selected = true;
         showStarField1CheckBox.visible = true;
         try
         {
            showStarField1CheckBox["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_showStarField3CheckBox_Scene1_Layer1_1() : *
      {
         try
         {
            showStarField3CheckBox["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         showStarField3CheckBox.enabled = true;
         showStarField3CheckBox.label = "";
         showStarField3CheckBox.labelPlacement = "right";
         showStarField3CheckBox.selected = false;
         showStarField3CheckBox.visible = true;
         try
         {
            showStarField3CheckBox["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_advanceButton_Scene1_Layer1_1() : *
      {
         try
         {
            advanceButton["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         advanceButton.emphasized = false;
         advanceButton.enabled = true;
         advanceButton.label = "switch on top field";
         advanceButton.labelPlacement = "right";
         advanceButton.selected = false;
         advanceButton.toggle = false;
         advanceButton.visible = true;
         try
         {
            advanceButton["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      public function onStarFieldReleased(... rest) : void
      {
         stage.removeEventListener(MouseEvent.MOUSE_MOVE,onStarFieldMoved);
         stage.removeEventListener(MouseEvent.MOUSE_UP,onStarFieldReleased);
      }
      
      internal function __setProp_noFieldOnTopRadioButton_Scene1_Layer1_1() : *
      {
         try
         {
            noFieldOnTopRadioButton["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         noFieldOnTopRadioButton.enabled = true;
         noFieldOnTopRadioButton.groupName = "RadioButtonGroup";
         noFieldOnTopRadioButton.label = "";
         noFieldOnTopRadioButton.labelPlacement = "right";
         noFieldOnTopRadioButton.selected = false;
         noFieldOnTopRadioButton.value = "none";
         noFieldOnTopRadioButton.visible = true;
         try
         {
            noFieldOnTopRadioButton["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      public function onStarFieldPressed(param1:MouseEvent) : void
      {
         draggingTarget = param1.target as Sprite;
         if(draggingTarget == starField1BorderSP)
         {
            draggingTarget = starField1;
         }
         else if(draggingTarget == starField2BorderSP)
         {
            draggingTarget = starField2;
         }
         else if(draggingTarget == starField3BorderSP)
         {
            draggingTarget = starField3;
         }
         if(draggingTarget == starField1)
         {
            onTopRadioButtonGroup.selectedData = "1";
         }
         else if(draggingTarget == starField2)
         {
            onTopRadioButtonGroup.selectedData = "2";
         }
         else if(draggingTarget == starField3)
         {
            onTopRadioButtonGroup.selectedData = "3";
         }
         if(draggingTarget != starField1)
         {
            xDraggingOffset = mouseX - draggingTarget.x;
            yDraggingOffset = mouseY - draggingTarget.y;
            stage.addEventListener(MouseEvent.MOUSE_MOVE,onStarFieldMoved);
            stage.addEventListener(MouseEvent.MOUSE_UP,onStarFieldReleased);
         }
      }
      
      internal function __setProp_useAlphaCheckBox_Scene1_Layer1_1() : *
      {
         try
         {
            useAlphaCheckBox["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         useAlphaCheckBox.enabled = true;
         useAlphaCheckBox.label = "make top field transparent";
         useAlphaCheckBox.labelPlacement = "right";
         useAlphaCheckBox.selected = false;
         useAlphaCheckBox.visible = true;
         try
         {
            useAlphaCheckBox["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      public function changeStarFieldPosition(param1:uint, param2:Object) : void
      {
         var _loc3_:Sprite = null;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         _loc3_ = param1 == 2 ? starField2 : starField3;
         _loc4_ = int(param2.x);
         _loc5_ = int(param2.y);
         if(!isNaN(_loc4_) && isFinite(_loc4_) && !isNaN(_loc5_) && isFinite(_loc5_))
         {
            if(_loc4_ < positionLimitsRect.left)
            {
               _loc4_ = positionLimitsRect.left;
            }
            else if(_loc4_ > positionLimitsRect.right)
            {
               _loc4_ = positionLimitsRect.right;
            }
            if(_loc5_ < positionLimitsRect.top)
            {
               _loc5_ = positionLimitsRect.top;
            }
            else if(_loc5_ > positionLimitsRect.bottom)
            {
               _loc5_ = positionLimitsRect.bottom;
            }
            _loc3_.x = _loc4_;
            _loc3_.y = _loc5_;
         }
         updatePositionTextInputs();
      }
      
      public function onInvertColorsToggled(... rest) : void
      {
         gammaTF.inverted = invertColorsCheckBox.selected;
      }
      
      internal function __setProp_xOffset2TextInput_Scene1_Layer1_1() : *
      {
         try
         {
            xOffset2TextInput["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         xOffset2TextInput.displayAsPassword = false;
         xOffset2TextInput.editable = true;
         xOffset2TextInput.enabled = true;
         xOffset2TextInput.maxChars = 3;
         xOffset2TextInput.restrict = "-0-9";
         xOffset2TextInput.text = "0";
         xOffset2TextInput.visible = true;
         try
         {
            xOffset2TextInput["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      public function onStarFieldMoved(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         _loc2_ = mouseX - xDraggingOffset;
         _loc3_ = mouseY - yDraggingOffset;
         if(_loc2_ < positionLimitsRect.left)
         {
            _loc2_ = positionLimitsRect.left;
            xDraggingOffset = mouseX - _loc2_;
         }
         else if(_loc2_ > positionLimitsRect.right)
         {
            _loc2_ = positionLimitsRect.right;
            xDraggingOffset = mouseX - _loc2_;
         }
         if(_loc3_ < positionLimitsRect.top)
         {
            _loc3_ = positionLimitsRect.top;
            yDraggingOffset = mouseY - _loc3_;
         }
         else if(_loc3_ > positionLimitsRect.bottom)
         {
            _loc3_ = positionLimitsRect.bottom;
            yDraggingOffset = mouseY - _loc3_;
         }
         draggingTarget.x = _loc2_;
         draggingTarget.y = _loc3_;
         updatePositionTextInputs();
         param1.updateAfterEvent();
      }
      
      internal function __setProp_yOffset2TextInput_Scene1_Layer1_1() : *
      {
         try
         {
            yOffset2TextInput["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         yOffset2TextInput.displayAsPassword = false;
         yOffset2TextInput.editable = true;
         yOffset2TextInput.enabled = true;
         yOffset2TextInput.maxChars = 3;
         yOffset2TextInput.restrict = "-0-9";
         yOffset2TextInput.text = "0";
         yOffset2TextInput.visible = true;
         try
         {
            yOffset2TextInput["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_field1OnTopRadioButton_Scene1_Layer1_1() : *
      {
         try
         {
            field1OnTopRadioButton["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         field1OnTopRadioButton.enabled = true;
         field1OnTopRadioButton.groupName = "RadioButtonGroup";
         field1OnTopRadioButton.label = "";
         field1OnTopRadioButton.labelPlacement = "right";
         field1OnTopRadioButton.selected = true;
         field1OnTopRadioButton.value = "1";
         field1OnTopRadioButton.visible = true;
         try
         {
            field1OnTopRadioButton["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_field3OnTopRadioButton_Scene1_Layer1_1() : *
      {
         try
         {
            field3OnTopRadioButton["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         field3OnTopRadioButton.enabled = true;
         field3OnTopRadioButton.groupName = "RadioButtonGroup";
         field3OnTopRadioButton.label = "";
         field3OnTopRadioButton.labelPlacement = "right";
         field3OnTopRadioButton.selected = false;
         field3OnTopRadioButton.value = "3";
         field3OnTopRadioButton.visible = true;
         try
         {
            field3OnTopRadioButton["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_field2OnTopRadioButton_Scene1_Layer1_1() : *
      {
         try
         {
            field2OnTopRadioButton["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         field2OnTopRadioButton.enabled = true;
         field2OnTopRadioButton.groupName = "RadioButtonGroup";
         field2OnTopRadioButton.label = "";
         field2OnTopRadioButton.labelPlacement = "right";
         field2OnTopRadioButton.selected = false;
         field2OnTopRadioButton.value = "2";
         field2OnTopRadioButton.visible = true;
         try
         {
            field2OnTopRadioButton["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      internal function __setProp_showStarField2CheckBox_Scene1_Layer1_1() : *
      {
         try
         {
            showStarField2CheckBox["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         showStarField2CheckBox.enabled = true;
         showStarField2CheckBox.label = "";
         showStarField2CheckBox.labelPlacement = "right";
         showStarField2CheckBox.selected = false;
         showStarField2CheckBox.visible = true;
         try
         {
            showStarField2CheckBox["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
      
      public function goToNextVisibleField(... rest) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:String = null;
         var _loc4_:int = 0;
         if(onTopRadioButtonGroup.selectedData == null || onTopRadioButtonGroup.selectedData == "none")
         {
            return;
         }
         _loc2_ = int(onTopRadioButtonGroup.selectedData) % 3 + 1;
         _loc4_ = 0;
         while(_loc4_ < 3)
         {
            _loc3_ = ((_loc2_ + _loc4_ - 1) % 3 + 1).toString();
            if(this["starField" + _loc3_].visible)
            {
               onTopRadioButtonGroup.selectedData = _loc3_;
               return;
            }
            _loc4_++;
         }
         onTopRadioButtonGroup.selectedData = "none";
      }
      
      public function updateFieldAlphas(... rest) : void
      {
         starField1.getChildAt(0).alpha = 1;
         starField2.getChildAt(0).alpha = 1;
         starField3.getChildAt(0).alpha = 1;
         if(onTopRadioButtonGroup.selectedData == null || onTopRadioButtonGroup.selectedData == "none")
         {
            return;
         }
         if(useAlphaCheckBox.selected)
         {
            this["starField" + onTopRadioButtonGroup.selectedData].getChildAt(0).alpha = 0.4;
         }
      }
      
      internal function __setProp_invertColorsCheckBox_Scene1_Layer1_1() : *
      {
         try
         {
            invertColorsCheckBox["componentInspectorSetting"] = true;
         }
         catch(e:Error)
         {
         }
         invertColorsCheckBox.enabled = true;
         invertColorsCheckBox.label = "invert colors";
         invertColorsCheckBox.labelPlacement = "right";
         invertColorsCheckBox.selected = false;
         invertColorsCheckBox.visible = true;
         try
         {
            invertColorsCheckBox["componentInspectorSetting"] = false;
         }
         catch(e:Error)
         {
         }
      }
   }
}

