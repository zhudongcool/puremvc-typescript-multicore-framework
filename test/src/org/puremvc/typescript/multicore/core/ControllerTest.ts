///<reference path='../../../../../../../test/lib/YUITest.d.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/multicore/interfaces/INotification.ts'/>

///<reference path='../../../../../../../src/org/puremvc/typescript/multicore/core/Controller.ts'/>
///<reference path='../../../../../../../src/org/puremvc/typescript/multicore/core/View.ts'/>
///<reference path='../../../../../../../src/org/puremvc/typescript/multicore/patterns/observer/Notification.ts'/>
///<reference path='../../../../../../../src/org/puremvc/typescript/multicore/patterns/command/SimpleCommand.ts'/>

///<reference path='ControllerTestVO.ts'/>
///<reference path='ControllerTestCommand2.ts'/>
///<reference path='ControllerTestCommand.ts'/>

module puremvc
{
	"use strict";

	import YUITest = module("YUITest");

	/**
	 * Test the PureMVC Controller class.
	 */
	export class ControllerTest
	{
		/**
		 * The name of the test case - if not provided, one is automatically generated by the
		 * YUITest framework.
		 */
		name:string = "PureMVC Controller class tests";

		/**
		 * Tests the Controller Singleton Factory Method
		 */
		testGetInstance():void
		{
			// Test Factory Method
			var controller:IController = Controller.getInstance('ControllerTestKey1');

			// test assertions
			YUITest.Assert.isNotNull
			(
				controller,
				"Expecting instance !== null"
			);

			YUITest.Assert.isInstanceOf
			(
				Controller,
				controller,
				"Expecting instance extends Controller"
			);

			Controller.removeController('ControllerTestKey1');
		}

		/**
		 * Tests Command registration and execution.
		 *
		 *
		 * This test gets the Singleton Controller instance
		 * and registers the ControllerTestCommand class
		 * to handle 'ControllerTest' Notifications.
		 *
		 *
		 * It then constructs such a Notification and tells the
		 * Controller to execute the associated Command.
		 * Success is determined by evaluating a property
		 * on an object passed to the Command, which will
		 * be modified when the Command executes.
		 */
		testRegisterAndExecuteCommand():void
		{
			// Create the controller, register the ControllerTestCommand to handle 'ControllerTest' notes
			var controller:IController = Controller.getInstance('ControllerTestKey2');
			controller.registerCommand( 'ControllerTest', ControllerTestCommand );

			// Create a 'ControllerTest' note
			var vo:ControllerTestVO = new ControllerTestVO(12);
			var note:Notification = new Notification( 'ControllerTest', vo );

			// Tell the controller to execute the Command associated with the note
			// the ControllerTestCommand invoked will multiply the vo.input value
			// by 2 and set the result on vo.result
			controller.executeCommand(note);

			// test assertions
			YUITest.Assert.areEqual
			(
				24,
				vo.result,
				"Expecting vo.result == 24"
			);

			Controller.removeController('ControllerTestKey2');
		}

		/**
		 * Tests Command registration and removal.
		 *
		 * Tests that once a Command is registered and verified
		 * working, it can be removed from the Controller.
		 */
		testRegisterAndRemoveCommand():void
		{
			// Create the controller, register the ControllerTestCommand to handle 'ControllerTest' notes
			var controller:IController = Controller.getInstance('ControllerTestKey3');
			controller.registerCommand( 'ControllerRemoveTest', ControllerTestCommand );

			// Create a 'ControllerTest' note
			var vo:ControllerTestVO = new ControllerTestVO(12) ;
			var note:Notification = new Notification( 'ControllerRemoveTest', vo );

			// Tell the controller to execute the Command associated with the note
			// the ControllerTestCommand invoked will multiply the vo.input value
			// by 2 and set the result on vo.result
			controller.executeCommand(note);

			// test assertions
			YUITest.Assert.areEqual
			(
				24,
				vo.result,
				"Expecting vo.result == 24"
			);

			// Reset result
			vo.result = 0;

			// Remove the Command from the Controller
			controller.removeCommand('ControllerRemoveTest');

			// Tell the controller to execute the Command associated with the
			// note. This time, it should not be registered, and our vo result
			// will not change
			controller.executeCommand(note);

			// test assertions
			YUITest.Assert.areEqual
			(
				0,
				vo.result,
				"Expecting vo.result == 0"
			);

			Controller.removeController('ControllerTestKey3');
		}

		/**
		 * Test hasCommand method.
		 */
		testHasCommand():void
		{
			// register the ControllerTestCommand to handle 'hasCommandTest' notes
			var controller:IController = Controller.getInstance('ControllerTestKey4');
			controller.registerCommand( 'hasCommandTest', ControllerTestCommand );

			// test that hasCommand returns true for hasCommandTest notifications
			YUITest.Assert.isTrue
			(
				controller.hasCommand('hasCommandTest'),
				"Expecting controller.hasCommand('hasCommandTest') === true"
			);

			// Remove the Command from the Controller
			controller.removeCommand('hasCommandTest');

			// test that hasCommand returns false for hasCommandTest notifications
			YUITest.Assert.isFalse
			(
				controller.hasCommand('hasCommandTest'),
				"Expecting controller.hasCommand('hasCommandTest') === false"
			);

			Controller.removeController('ControllerTestKey4');
		}

		/**
		 * Tests Removing and Reregistering a Command
		 *
		 * Tests that when a Command is re-registered that it isn't fired twice. This involves,
		 * minimally, registration with the controller but notification via the View, rather than
		 * direct execution of the Controller's executeCommand method as is done above in
		 * testRegisterAndRemove.
		 */
		testReregisterAndExecuteCommand():void
		{
			// Fetch the controller, register the ControllerTestCommand2 to handle 'ControllerTest2' notes
			var controller:IController = Controller.getInstance('ControllerTestKey5');
			controller.registerCommand( 'ControllerTest2', ControllerTestCommand2 );

			// Remove the Command from the Controller
			controller.removeCommand('ControllerTest2');

			// Re-register the Command with the Controller
			controller.registerCommand( 'ControllerTest2', ControllerTestCommand2 );

			// Create a 'ControllerTest2' note
			var vo:ControllerTestVO = new ControllerTestVO( 12 );
			var note:Notification = new Notification( 'ControllerTest2', vo );

			// retrieve a reference to the View.
			var view:IView = View.getInstance('ControllerTestKey5');

			// send the Notification
			view.notifyObservers(note);

			// test assertions
			// if the command is executed once the value will be 24
			YUITest.Assert.areEqual
			(
				24,
				vo.result,
				"Expecting vo.result == 24"
			);

			// Prove that accumulation works in the VO by sending the notification again
			view.notifyObservers(note);

			// if the command is executed twice the value will be 48
			YUITest.Assert.areEqual
			(
				48,
				vo.result,
				"Expecting vo.result == 48"
			);

			Controller.removeController('ControllerTestKey5');
		}
	}
}