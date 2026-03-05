import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat; // price in cents
    category : Text;
    imageId : ?Text; // reference to blob storage
    inStock : Bool;
  };

  type OrderItem = {
    productId : Text;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #completed;
    #cancelled;
  };

  type Order = {
    id : Text;
    customerName : Text;
    phoneNumber : Text;
    address : Text;
    items : [OrderItem];
    status : OrderStatus;
    totalPrice : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  // State
  type State = {
    products : Map.Map<Text, Product>;
    orders : Map.Map<Text, Order>;
    categories : Set.Set<Text>;
  };

  let state = {
    products = Map.empty<Text, Product>();
    orders = Map.empty<Text, Order>();
    categories = Set.empty<Text>();
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin only)
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    if (state.products.containsKey(product.id)) {
      Runtime.trap("Product with this ID already exists");
    };

    state.categories.add(product.category);
    state.products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    if (not state.products.containsKey(product.id)) {
      Runtime.trap("Product not found");
    };

    state.categories.add(product.category);
    state.products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not state.products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    state.products.remove(productId);
  };

  // Public product queries
  public query ({ caller }) func getProducts(category : ?Text) : async [Product] {
    switch (category) {
      case (null) {
        state.products.values().toArray();
      };
      case (?cat) {
        state.products.values().toArray().filter(
          func(p) { p.category == cat }
        );
      };
    };
  };

  public query ({ caller }) func getProductById(productId : Text) : async Product {
    switch (state.products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getCategories() : async [Text] {
    state.categories.toArray();
  };

  // Order Management (Public)
  public shared ({ caller }) func placeOrder(order : Order) : async () {
    if (state.orders.containsKey(order.id)) {
      Runtime.trap("Order with this ID already exists");
    };

    var totalPrice = 0;
    for (item in order.items.values()) {
      let product = switch (state.products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId) };
        case (?product) { product };
      };

      if (not product.inStock) {
        Runtime.trap("Product not in stock: " # product.name);
      };

      totalPrice += product.price * item.quantity;
    };

    let newOrder : Order = {
      order with
      status = #pending;
      totalPrice;
      customerName = order.customerName;
      phoneNumber = order.phoneNumber;
      address = order.address;
    };

    state.orders.add(order.id, newOrder);
  };

  // Order Management (Admin only)
  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    state.orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let order = switch (state.orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = {
      order with
      status;
    };

    state.orders.add(orderId, updatedOrder);
  };
};
